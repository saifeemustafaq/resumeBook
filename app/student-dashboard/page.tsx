import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import ProfileForm from '../components/student/ProfileForm';

export default async function StudentDashboard() {
  const session = await getServerSession();
  
  if (!session?.user) {
    redirect('/student-login');
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="py-10">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Student Profile</h1>
          <ProfileForm />
        </div>
      </main>
    </div>
  );
} 