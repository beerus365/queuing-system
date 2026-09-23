import { supabase } from '@/lib/server';
import Clock from '@/components/clock'
import QueueButton from '@/components/QueueButton';
import { getEstimatedTime } from '@/components/estimated_time';
import { showCurrentQueue } from "@/components/status";
import AutoRefresh from '@/components/auto-refresh';

export const dynamic = 'force-dynamic';

export default async function Main() {

  const { data, error, count } = await supabase
  .from('user')
  .select("*", { count: 'exact'})
  .eq('status', 'Pending')
  .neq('status', 'Complete')
  .order('number', { ascending: true });

  const queueData = (data ?? []).filter((user) => user.status !== 'Complete');
  const currentServingTicket = await showCurrentQueue();

  if (error) {
    console.error(`Supabase query failed: ${error.message}`);
    return <p>Error returning name</p>;
  }

  console.log({ error, data });


  return (
    <main className="fixed inset-x-0 bottom-0 top-30 flex min-h-0 flex-col items-center overflow-hidden overscroll-none bg-background sm:static sm:h-auto sm:min-h-0 sm:flex-1">
      <AutoRefresh />
      <div className="mx-4 mt-4 sm:mt-10 flex w-full flex-row items-center justify-center gap-4 p-4 sm:w-3/4">
        <span className="card">
          <p>Waiting</p>
          <h1>{count ?? 0}</h1>
        </span>

        <span className="card">
          <p>Serving</p>
          <h1>{currentServingTicket ? `Q-${currentServingTicket.ticket_number}` : '--'}</h1>
        </span>

        <span className="card">
          <p>Time</p>
          <Clock />
        </span>    
      </div>

      <div className="queue-list mx-4 mb-4 flex min-h-0 w-[calc(100%-2rem)] flex-1 flex-col gap-2 overflow-hidden rounded-lg border-2 border-gray-300 bg-foreground2 px-6 py-4 text-black sm:mb-8 sm:px-6 sm:py-6 sm:w-3/4 sm:mt-4">
        <span className='flex flex-row justify-between items-center mb-2'>
          <p className="text-xs text-gray-500 sm:text-base">Waiting queue</p>
          <span className="flex flex-row items-start gap-2">
              <p className="text-xs text-gray-500 sm:text-base">{count}</p>
              <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="h-4 w-4 shrink-0 sm:h-6 sm:w-6">
              <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
            </svg>
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
        <span className='mt-auto self-end items-end'>

          <QueueButton/>
        </span>
      </div>
    </main>
  );
}