import { showCurrentQueue } from "@/components/status";

const Header = async () => {
    const currentServingTicket = await showCurrentQueue();

    return (
        <header className="fixed inset-x-0 top-0 z-60 flex flex-col gap-4 bg-foreground px-4 py-4 text-white sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-8">
            <div className="flex min-w-0 flex-col items-start">
                <p className="text-xs sm:text-sm">That's My QueueMboy</p>
                <h1 className="text-lg font-bold sm:text-2xl">TMQ - Queuing System</h1>
            </div>

            <div className="flex flex-col items-start sm:items-end">
                <p className="text-xs sm:text-sm">Now Serving</p>
                <h1 className="text-lg font-bold sm:text-2xl">
                    {currentServingTicket ? `Q-${currentServingTicket.ticket_number}` : '--'}
                </h1>
            </div>
        </header>
    );
};

export default Header;