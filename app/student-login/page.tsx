import LoginForm from '../components/auth/LoginForm';

export default function StudentLoginPage() {
  return (
    <main className="min-h-screen py-12 bg-gray-50">
      <div className="max-w-md mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-center mb-6">Student Login</h1>
          <LoginForm userType="student" />
        </div>
      </div>
    </main>
  );
} 