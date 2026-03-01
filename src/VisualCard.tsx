import { useEffect, useRef, useState } from 'react';
import { useMode } from '@/contexts/ModeContext';
import { Link } from 'react-router-dom';
import {
  Clock,
  MessageSquare,
  MoreVertical,
  Trash2,
  Pencil,
  Box,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { formatDistanceToNow } from 'date-fns';
import { HistoryConversation } from '@/types/misc';
import { supabase } from '@/lib/supabase';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import * as THREE from 'three';

// ---- Sequential worker for thumbnail compilations ----
const COMPILE_TIMEOUT_MS = 60_000;

type QueueItem = {
  code: string;
  resolve: (blob: Blob | null) => void;
};

const jobQueue: QueueItem[] = [];
let thumbnailWorker: Worker | null = null;
let currentJob: QueueItem | null = null;
let currentTimeout: ReturnType<typeof setTimeout> | null = null;

// ---- Architecture library cache ----
let archLibBuffer: ArrayBuffer | null = null;
let archLibFetching = false;
let archLibCallbacks: ((buf: ArrayBuffer | null) => void)[] = [];

function getArchLib(): Promise<ArrayBuffer | null> {
  if (archLibBuffer) return Promise.resolve(archLibBuffer);
  return new Promise((resolve) => {
    archLibCallbacks.push(resolve);
    if (!archLibFetching) {
      archLibFetching = true;
      fetch(`${import.meta.env.BASE_URL}libraries/architecture_parts.scad`)
        .then((r) => r.arrayBuffer())
        .then((buf) => {
          archLibBuffer = buf;
          archLibCallbacks.forEach((cb) => cb(buf));
          archLibCallbacks = [];
        })
        .catch(() => {
          archLibCallbacks.forEach((cb) => cb(null));
          archLibCallbacks = [];
        });
    }
  });
}

function getOrCreateWorker(): Worker {
  if (thumbnailWorker) return thumbnailWorker;

  const w = new Worker(new URL('../../worker/worker.ts', import.meta.url), {
    type: 'module',
  });

  w.addEventListener('message', (event: MessageEvent) => {
    const { type, err } = event.data;
    if (type === 'preview' || type === 'export') {
      if (currentTimeout) {
        clearTimeout(currentTimeout);
        currentTimeout = null;
      }
      const job = currentJob;
      currentJob = null;
      if (job) {
        if (err || !event.data.data?.output) {
          console.warn(
            '[VisualCard] Compile failed:',
            err?.message || 'no output',
          );
          job.resolve(null);
        } else {
          job.resolve(
            new Blob([event.data.data.output], { type: 'model/stl' }),
          );
        }
      }
      processNext();
    }
  });

  w.addEventListener('error', (event) => {
    console.error('[VisualCard] Worker error:', event.message);
    if (currentTimeout) {
      clearTimeout(currentTimeout);
      currentTimeout = null;
    }
    const job = currentJob;
    currentJob = null;
    if (job) job.resolve(null);

    thumbnailWorker = null;
    try {
      w.terminate();
    } catch {
      /* ignore */
    }
    processNext();
  });

  thumbnailWorker = w;
  return w;
}

function processNext() {
  if (currentJob || jobQueue.length === 0) return;

  const job = jobQueue.shift()!;
  currentJob = job;

  // Prepend _render_component = "all" for architecture code that uses render_if
  const code = job.code.includes('render_if')
    ? `_render_component = "all";\n${job.code}`
    : job.code;

  const startCompile = () => {
    const worker = getOrCreateWorker();
    worker.postMessage({
      type: 'preview',
      data: { code, params: [], fileType: 'stl' },
    });

    currentTimeout = setTimeout(() => {
      console.warn(
        '[VisualCard] Compile timed out after',
        COMPILE_TIMEOUT_MS,
        'ms',
      );
      currentTimeout = null;
      const timedOutJob = currentJob;
      currentJob = null;
      if (timedOutJob) timedOutJob.resolve(null);

      if (thumbnailWorker) {
        try {
          thumbnailWorker.terminate();
        } catch {
          /* ignore */
        }
        thumbnailWorker = null;
      }
      processNext();
    }, COMPILE_TIMEOUT_MS);
  };

  // Write architecture_parts.scad to worker FS before compiling if needed
  if (code.includes('architecture_parts.scad')) {
    getArchLib().then((buf) => {
      if (buf) {
        getOrCreateWorker().postMessage({
          type: 'fs.write',
          data: {
            path: 'architecture_parts.scad',
            content: buf,
            type: 'text/plain',
          },
        });
      }
      startCompile();
    });
  } else {
    startCompile();
  }
}

function compileForThumbnail(code: string): Promise<Blob | null> {
  return new Promise((resolve) => {
    jobQueue.push({ code, resolve });
    processNext();
  });
}

// ---- Static thumbnail renderer (single shared WebGL context) ----
const THUMB_SIZE = 512;
let sharedRenderer: THREE.WebGLRenderer | null = null;

function renderThumbnail(
  geometry: THREE.BufferGeometry,
  isArch: boolean,
): string {
  if (!sharedRenderer) {
    const canvas = document.createElement('canvas');
    canvas.width = THUMB_SIZE;
    canvas.height = THUMB_SIZE;
    sharedRenderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      preserveDrawingBuffer: true,
    });
    sharedRenderer.setSize(THUMB_SIZE, THUMB_SIZE);
    sharedRenderer.toneMapping = THREE.ACESFilmicToneMapping;
    sharedRenderer.toneMappingExposure = 1.0;
  }

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#1a1a1a');

  const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 2000);

  // Center and measure geometry
  const centeredGeo = geometry.clone();
  centeredGeo.center();
  centeredGeo.computeBoundingBox();
  const box = centeredGeo.boundingBox!;
  const size = new THREE.Vector3();
  box.getSize(size);
  // After rotation: width=x, height=z, depth=y
  const maxDim = Math.max(size.x, size.y, size.z);
  const dist = maxDim * 1.8;

  camera.position.set(-dist * 0.7, dist * 0.6, dist * 0.7);
  camera.lookAt(0, 0, 0);

  // Lighting
  scene.add(new THREE.AmbientLight(0xffffff, 0.7));
  const dir1 = new THREE.DirectionalLight(0xffffff, 1.5);
  dir1.position.set(5, 8, 5);
  scene.add(dir1);
  const dir2 = new THREE.DirectionalLight(0xffffff, 0.4);
  dir2.position.set(-5, 5, -3);
  scene.add(dir2);
  const dir3 = new THREE.DirectionalLight(0xffffff, 0.3);
  dir3.position.set(0, -3, 5);
  scene.add(dir3);

  // Mesh
  const material = new THREE.MeshStandardMaterial({
    color: isArch ? '#C77DFF' : '#00A6FF',
    metalness: 0.5,
    roughness: 0.35,
  });
  const mesh = new THREE.Mesh(centeredGeo, material);
  mesh.rotation.set(-Math.PI / 2, 0, 0);
  scene.add(mesh);

  // Render
  sharedRenderer.render(scene, camera);
  const dataURL = sharedRenderer.domElement.toDataURL('image/png');

  // Cleanup
  material.dispose();
  centeredGeo.dispose();

  return dataURL;
}

// ---- Components ----

interface VisualCardProps {
  conversation: HistoryConversation;
  onDelete: (conversationId: string) => void;
  onRename: (conversationId: string, newTitle: string) => void;
}

export function VisualCard({
  conversation,
  onDelete,
  onRename,
}: VisualCardProps) {
  const { mode } = useMode();
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'compiling' | 'done' | 'error'
  >('idle');
  const cardRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);
  const isArch = mode === 'architecture';

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { rootMargin: '50px' },
    );
    observer.observe(el);
    return () => observer.unobserve(el);
  }, []);

  // Fetch artifact + compile + render to static image when visible
  useEffect(() => {
    if (!isVisible || startedRef.current) return;
    startedRef.current = true;
    let cancelled = false;

    (async () => {
      try {
        setStatus('loading');

        // Fetch latest artifact from assistant messages
        const { data: messages, error } = await supabase
          .from('messages')
          .select('content')
          .eq('conversation_id', conversation.id)
          .eq('role', 'assistant')
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) {
          console.error('[VisualCard] Supabase error:', error);
          throw error;
        }
        if (cancelled) return;

        // Find message with artifact code
        const msg = messages?.find(
          (m) =>
            m.content &&
            typeof m.content === 'object' &&
            'artifact' in m.content &&
            m.content.artifact,
        );

        if (!msg) {
          setStatus('error');
          return;
        }

        const content = msg.content as Record<string, unknown>;
        const artifact = content.artifact as
          | Record<string, unknown>
          | undefined;
        if (!artifact || typeof artifact.code !== 'string') {
          setStatus('error');
          return;
        }

        // Compile via sequential worker
        setStatus('compiling');
        const blob = await compileForThumbnail(artifact.code as string);
        if (cancelled || !blob) {
          if (!cancelled) setStatus('error');
          return;
        }

        // Parse STL
        const buffer = await blob.arrayBuffer();
        if (cancelled) return;
        const loader = new STLLoader();
        const geom = loader.parse(buffer);
        geom.computeVertexNormals();

        // Render to static image using shared renderer (single WebGL context)
        const dataURL = renderThumbnail(geom, isArch);
        geom.dispose();

        if (cancelled) return;
        setThumbnailUrl(dataURL);
        setStatus('done');
      } catch (err) {
        console.error('[VisualCard] Thumbnail error:', err);
        if (!cancelled) setStatus('error');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isVisible, conversation.id, isArch]);

  return (
    <div
      ref={cardRef}
      className={`group relative overflow-hidden rounded-xl border-2 border-adam-neutral-700 bg-adam-background-2 transition-all duration-200 ${isArch ? 'hover:border-[#C77DFF] hover:shadow-[0_0_20px_rgba(199,125,255,0.3)]' : 'hover:border-adam-blue hover:shadow-[0_0_20px_rgba(0,166,255,0.3)]'}`}
    >
      <Link to={`/editor/${conversation.id}`}>
        <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-adam-background-1 to-adam-background-2">
          {status === 'done' && thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={conversation.title}
              className="h-full w-full object-cover"
            />
          ) : status === 'loading' || status === 'compiling' ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <Loader2
                  className={`h-8 w-8 animate-spin ${isArch ? 'text-[#C77DFF]' : 'text-adam-blue'}`}
                />
                <span className="text-xs text-adam-neutral-400">
                  {status === 'loading' ? 'Loading...' : 'Compiling...'}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Box className="text-adam-neutral-600 h-16 w-16 opacity-30" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-adam-background-2/90 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
        </div>

        <div className="p-4">
          <h3 className="mb-2 line-clamp-2 text-base font-medium text-adam-neutral-50">
            {conversation.title}
          </h3>
          <div className="flex items-center gap-3 text-xs text-adam-neutral-400">
            <span className="flex items-center">
              <Clock className="mr-1 h-3 w-3" />
              {formatDistanceToNow(new Date(conversation.updated_at), {
                addSuffix: true,
              })}
            </span>
            <span className="flex items-center">
              <MessageSquare className="mr-1 h-3 w-3" />
              {conversation.message_count}
            </span>
          </div>
        </div>
      </Link>

      <div className="absolute right-2 top-2">
        <AlertDialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 rounded-full bg-adam-background-1/80 p-0 backdrop-blur-sm transition-colors duration-200 hover:bg-adam-neutral-950"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4 text-adam-neutral-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#191A1A]">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onRename(conversation.id, conversation.title);
                }}
                className="text-adam-neutral-50 hover:cursor-pointer hover:bg-adam-neutral-950 focus:bg-adam-neutral-950"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Rename
              </DropdownMenuItem>
              <AlertDialogTrigger asChild onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem className="text-adam-neutral-50 hover:cursor-pointer hover:bg-adam-neutral-950 hover:text-red-500 focus:bg-adam-neutral-950 focus:text-red-500">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </AlertDialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>
          <AlertDialogContent className="border-[2px] border-adam-neutral-700 bg-adam-background-1">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-adam-neutral-100">
                Delete Creation
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this creation? This action
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={(e) => e.stopPropagation()}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(conversation.id);
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
