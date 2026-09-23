import { supabase } from '@/lib/server';
import { serveNextPending, showCurrentQueue } from '@/components/status';
import QueueButton from '@/components/QueueButton';
import { getEstimatedTime } from '@/components/estimated_time';
import { logout } from '@/app/actions/auth';
import { createClient } from '@/lib/supabase/server';
import AutoRefresh from '@/components/auto-refresh';

export const dynamic = 'force-dynamic';
  
export default async function Home() {
  const supabaseAuth = await createClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();

  if (!user) {
    return null;
  }
  
  const currentServingTicket = await showCurrentQueue();
  
  const { data, error, count } = await supabase
  .from('user')
  .select("*", { count: 'exact'})
  .eq('status', 'Pending')
  .neq('status', 'Complete')
  .order('number', { ascending: true });

  const queueData = (data ?? []).filter((user) => user.status !== 'Complete');
  
  if (error) {
    console.error(`Supabase query failed: ${error.message}`);
    return <p>Error returning name</p>;
  }

  console.log({ error, data });
  
  return (
    <main className="fixed inset-x-0 bottom-0 top-30 flex min-h-0 flex-col items-center overflow-hidden overscroll-none bg-background sm:static sm:h-auto sm:min-h-0 sm:flex-1">
      <AutoRefresh />
      <div className="w-full mx-4 mt-4 sm:w-3/4 sm:mt-8 flex flex-row items-center justify-center gap-4 p-4">
        <span className="card">
          <p>Serving</p>
          <h1>{currentServingTicket ? `Q-${currentServingTicket.ticket_number}` : '--'}</h1>
        </span>
  
        <span className="card">
          <p>Waiting</p>
          <h1>{count ?? 0}</h1>
        </span>
  
        <span className="card">
          <p>ETA</p>
          <h1>0</h1>
        </span>    
      </div>
  
      <div className="w-[calc(100%-2rem)] mx-4 flex flex-col justify-center gap-2 p-6 mt-auto sm:w-3/4 sm:mt-auto sm:p-5 bg-foreground3 text-white rounded-lg">
        <p className="text-sm sm:text-base">Now Serving</p>
        <h1 className="text-2xl font-bold sm:text-4xl">
          {currentServingTicket ? `Q-${currentServingTicket.ticket_number}` : '--'}
        </h1>
        <p className="text-sm sm:text-md">
          {currentServingTicket
            ? `${currentServingTicket.name} - ${currentServingTicket.transaction_type}`
            : '--'}
        </p>
        <form action={serveNextPending}>
          <button type="submit" className="flex w-full flex-row justify-center items-center gap-4 bg-button-bg hover:bg-button-hover text-white text-sm py-2 sm:py-3 rounded-lg mt-2 cursor-pointer">
          <svg 
            viewBox="0 0 26 26" 
            id="check-mark-circle-2" 
            xmlns="http://www.w3.org/2000/svg" 
            className="icon line w-8 h-8 sm:w-10 sm:h-10"
          >
            <path 
              id="primary" 
              d="M20.94,11A8.26,8.26,0,0,1,21,12a9,9,0,1,1-9-9,8.83,8.83,0,0,1,4,1" 
              style={{ fill: "none", stroke: "#ffffff", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5 }}
            />
            <polyline 
              id="primary-2" 
              data-name="primary" 
              points="21 5 12 14 8 10" 
              style={{ fill: "none", stroke: "#ffffff", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5 }}
            />
          </svg>
          Mark as Served
          </button>
        </form>
      </div>
  
      <div className="queue-list mx-4 mt-4 mb-6 flex min-h-0 w-[calc(100%-2rem)] flex-1 flex-col gap-2 overflow-hidden rounded-lg border-2 border-gray-300 bg-foreground2 px-6 py-4 text-black sm:mb-4 sm:w-3/4 sm:mt-4 sm:px-6 sm:py-6 max-h-[calc(100%-1.5rem)]">
        <span className='flex flex-row justify-between items-center mb-2'>
          <p className="text-xs text-gray-500 sm:text-base">Waiting queue</p>
          <span className="flex flex-row items-center gap-2">
              <p className="text-xs text-gray-500 sm:text-base">{count}</p>
              <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="h-4 w-4 shrink-0 sm:h-6 sm:w-6">
              <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
            </svg>
            <form action={logout}>
              <button type="submit" className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-xs text-black cursor-pointer hover:bg-gray-100 sm:text-sm">
                Log out
              </button>
            </form>
          </span>
        </span>
        <div className='name-queue scrollbar-hidden flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto border-t border-b border-gray-400'>
          {queueData.map((user, index) => (
            <ul
              key={user.number}
              className={`flex flex-row items-center gap-4 rounded-lg px-2 py-2 sm:px-4 sm:py-4 ${
                index === 0 ? 'bg-red-100' : index === 1 ? 'bg-red-100' : 'bg-background'
              }`}
            >
              <h1 className='text-md font-bold sm:text-2xl'>Q-{user.ticket_number}</h1>
              <span className='flex flex-col text-xs sm:text-'>
                <span>{user.name}</span>
                <span className='flex flex-row gap-1'>
                  <span className='text-gray-500'>{user.transaction_type} </span>
                  <span className='text-gray-500'>· {getEstimatedTime(user.transaction_type)} min</span>
                </span>
              </span>
            </ul>
          ))}
        </div>
      </div>
    </main>
  );
}