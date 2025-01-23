import LoginForm from '../components/auth/LoginForm';

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen py-12 bg-gray-50">
      <div className="max-w-md mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-center mb-6">Admin Login</h1>
          <LoginForm userType="admin" />
        </div>
      </div>
    </main>
  );
} 