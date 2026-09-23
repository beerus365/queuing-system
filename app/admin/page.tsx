import { redirect } from 'next/navigation';
import LoginForm from './login-form';
import { createClient } from '@/lib/supabase/server';

const Admin = async () => {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        redirect('/admin/main');
    }

    return (
        <main className="fixed inset-0 z-50 flex min-h-screen w-full items-center justify-center overflow-y-auto bg-background px-4 py-8 sm:px-6">
            <div className="flex w-full max-w-md flex-col items-center justify-center rounded-lg border-2 border-gray-300 bg-amber-50 px-5 py-8 text-black sm:px-8 sm:py-12">
                <h1 className="text-center text-2xl font-bold">Staff Login</h1>
                <LoginForm />
            </div>
        </main>
    );
};

export default Admin;