import { Link, useNavigate } from 'react-router-dom';
import { Plus, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { ConditionalWrapper } from './ConditionalWrapper';
import { Conversation } from '@shared/types';
import { ModeSwitcher } from './ModeSwitcher';
import { useMode } from '@/contexts/ModeContext';

interface SidebarProps {
  isSidebarOpen: boolean;
}

export function Sidebar({ isSidebarOpen }: SidebarProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { mode } = useMode();

  const { data: recentConversations } = useQuery<Conversation[]>({
    queryKey: ['conversations', 'recent', mode],
    initialData: [],
    queryFn: async () => {
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select('*')
        .order('updated_at', { ascending: false })
        .eq('user_id', user?.id ?? '')
        .eq('mode', mode)
        .limit(10);

      if (error) throw error;

      const conversationsWithTitles = await Promise.all(
        (conversations || []).map(async (conv) => {
          if (
            conv.title &&
            conv.title.toLowerCase() !== 'new conversation' &&
            conv.title.toLowerCase() !== 'untitled' &&
            conv.title.toLowerCase() !== 'conversation'
          ) {
            return conv;
          }

          const { data: messages } = await supabase
            .from('messages')
            .select('content')
            .eq('conversation_id', conv.id)
            .eq('role', 'user')
            .order('created_at', { ascending: true })
            .limit(1);

          if (messages && messages.length > 0) {
            const firstMessage = messages[0];
            let text = '';
            if (
              firstMessage.content &&
              typeof firstMessage.content === 'object' &&
              'text' in firstMessage.content
            ) {
              text = String(firstMessage.content.text || '');
            }
            const preview = text.substring(0, 40).trim();
            return {
              ...conv,
              title: preview || conv.title || 'Untitled Creation',
            };
          }

          return conv;
        }),
      );

      return conversationsWithTitles;
    },
  });

  return (
    <div
      className={`${isSidebarOpen ? 'w-64' : 'w-16'} flex h-full flex-shrink-0 flex-col border-r border-adam-neutral-700 bg-adam-background-1 pb-2 transition-all duration-300 ease-in-out`}
    >
      <div className="p-4 dark:border-gray-800">
        <ConditionalWrapper
          condition={!isSidebarOpen}
          wrapper={(children) => (
            <Tooltip>
              <TooltipTrigger asChild>{children}</TooltipTrigger>
              <TooltipContent side="right" className="flex flex-col">
                <span className="font-semibold">Home</span>
                <span className="text-xs text-muted-foreground">Home Page</span>
              </TooltipContent>
            </Tooltip>
          )}
        >
          <Link to="/">
            <div className="flex cursor-pointer items-center space-x-2">
              {isSidebarOpen ? (
                <div className="flex w-full items-center justify-center">
                  {mode === 'architecture' ? (
                    <img
                      className="mx-auto h-12 w-full object-contain"
                      src={`${import.meta.env.BASE_URL}logos/parametrix-logo-full.svg`}
                      alt="Parametrix"
                    />
                  ) : (
                    <img
                      className="mx-auto h-8 w-full"
                      src={`${import.meta.env.BASE_URL}adam-logo-full.svg`}
                      alt="CADAM"
                    />
                  )}
                </div>
              ) : (
                <img
                  src={
                    mode === 'architecture'
                      ? `${import.meta.env.BASE_URL}logos/parametrix-logo.svg`
                      : `${import.meta.env.BASE_URL}adam-logo.svg`
                  }
                  alt="Logo"
                  className={
                    mode === 'architecture'
                      ? 'h-9 w-9 min-w-9 rounded-md object-contain'
                      : 'h-8 w-8 min-w-8 object-contain'
                  }
                />
              )}
            </div>
          </Link>
        </ConditionalWrapper>
      </div>

      {isSidebarOpen && (
        <div className="px-4 pb-3">
          <ModeSwitcher />
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col">
        <div
          className={`${isSidebarOpen ? 'px-4' : 'px-2'} flex-1 py-2 transition-all duration-300 ease-in-out`}
        >
          <ConditionalWrapper
            condition={!isSidebarOpen}
            wrapper={(children) => (
              <Tooltip>
                <TooltipTrigger asChild>{children}</TooltipTrigger>
                <TooltipContent side="right" className="flex flex-col">
                  <span className="font-semibold">New Creation</span>
                  <span className="text-xs text-muted-foreground">
                    Start a new conversation
                  </span>
                </TooltipContent>
              </Tooltip>
            )}
          >
            <div className="ml-[9px]">
              <Button
                variant="secondary"
                className={` ${
                  isSidebarOpen
                    ? `flex w-[216px] items-center justify-start gap-2 rounded-xl border bg-adam-neutral-900 px-4 py-2.5 text-adam-neutral-200 hover:text-adam-text-primary ${mode === 'architecture' ? 'border-[#C77DFF] hover:bg-[#C77DFF]/10' : 'border-adam-blue hover:bg-adam-blue/10'}`
                    : `flex h-[30px] w-[30px] items-center justify-center rounded-[8px] border-2 bg-adam-neutral-900 p-[2px] text-adam-neutral-200 hover:text-adam-text-primary ${mode === 'architecture' ? 'border-[#C77DFF] shadow-[0px_4px_10px_0px_rgba(199,125,255,0.15)] hover:bg-[#C77DFF]/10' : 'border-adam-blue shadow-[0px_4px_10px_0px_rgba(0,166,255,0.15)] hover:bg-adam-blue/10'}`
                } mb-4`}
                onClick={() => navigate('/')}
              >
                <Plus
                  className={`h-5 w-5 ${!isSidebarOpen ? 'text-adam-neutral-300 hover:text-adam-text-primary' : ''}`}
                />
                {isSidebarOpen && (
                  <div className="text-sm font-semibold leading-[14px] tracking-[-0.14px] text-adam-neutral-200">
                    New Creation
                  </div>
                )}
              </Button>
            </div>
          </ConditionalWrapper>
          <nav className="space-y-1">
            {[
              {
                icon: LayoutGrid,
                label: 'Creations',
                href: '/history',
                description: 'View past creations',
                submenu: recentConversations,
              },
            ].map(({ icon: Icon, label, href, description, submenu }) => (
              <div key={label} className="space-y-1">
                <ConditionalWrapper
                  condition={!isSidebarOpen}
                  wrapper={(children) => (
                    <Tooltip>
                      <TooltipTrigger asChild>{children}</TooltipTrigger>
                      <TooltipContent side="right" className="flex flex-col">
                        <span className="font-semibold">{label}</span>
                        <span className="text-xs text-muted-foreground">
                          {description}
                        </span>
                      </TooltipContent>
                    </Tooltip>
                  )}
                >
                  <Link to={href}>
                    <Button
                      variant={
                        isSidebarOpen ? 'adam_dark' : 'adam_dark_collapsed'
                      }
                      className={`${isSidebarOpen ? 'w-full justify-start' : 'ml-[1px] h-[46px] w-[46px] p-0'}`}
                    >
                      <Icon
                        className={`${isSidebarOpen ? 'mr-2' : ''} h-[22px] w-[22px] min-w-[22px]`}
                      />
                      {isSidebarOpen && label}
                    </Button>
                  </Link>
                </ConditionalWrapper>
                {isSidebarOpen && submenu && (
                  <ul className="ml-7 flex list-none flex-col gap-1 border-l border-adam-neutral-700 px-2">
                    {submenu.map(
                      (
                        conversation: Omit<
                          Conversation,
                          'message_count' | 'last_message_at'
                        >,
                      ) => {
                        return (
                          <Link
                            to={`/editor/${conversation.id}`}
                            key={conversation.id}
                          >
                            <li key={conversation.id}>
                              <span className="line-clamp-1 text-ellipsis text-nowrap rounded-md p-1 text-xs font-medium text-adam-neutral-300 transition-colors duration-200 ease-in-out [@media(hover:hover)]:hover:bg-adam-neutral-900 [@media(hover:hover)]:hover:text-adam-neutral-50">
                                {conversation.title}
                              </span>
                            </li>
                          </Link>
                        );
                      },
                    )}
                  </ul>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}

