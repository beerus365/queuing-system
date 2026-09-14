const Admin = () => {
    return (
        <main className="fixed inset-0 z-50 flex min-h-screen w-full items-center justify-center overflow-y-auto bg-background px-4 py-8 sm:px-6">
            <div className="flex w-full max-w-md flex-col items-center justify-center rounded-lg border-2 border-gray-300 bg-amber-50 px-5 py-8 text-black sm:px-8 sm:py-12">
                <h1 className="text-center text-2xl font-bold">Staff Login</h1>

                <div className="mt-4 flex w-full flex-col items-center">
                    <label htmlFor="staff-login" className="mb-2 self-start">
                        Username
                    </label>
                    <input
                        type="text"
                        id="staff-login"
                        name="staff-login"
                        placeholder="Enter your staff ID"
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <label htmlFor="staff-password" className="mb-2 mt-4 self-start">
                        Password
                    </label>
                    <input
                        type="password"
                        id="staff-password"
                        name="staff-password"
                        placeholder="Enter your password"
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <button className="mt-4 w-full cursor-pointer rounded-lg bg-foreground px-4 py-2.5 text-white transition-transform duration-300 hover:scale-105 hover:bg-[var(--hover)]">
                        Login
                    </button>
                </div>

            </div>
        </main>
    );
};

export default Admin;