import React from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../../../context/AuthContext';
import AdminLayout from '../../../components/layouts/AdminLayout';
import { PetForm } from '../../../components/ui/pet-form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

const CreatePetPage: NextPage = () => {
  const { isAdmin } = useAuth();
  const router = useRouter();

  // Redirect non-admin users
  React.useEffect(() => {
    if (isAdmin === false) {
      router.push('/');
    }
  }, [isAdmin, router]);

  return (
    <AdminLayout>
      <Head>
        <title>Thêm thú cưng mới | Admin</title>
      </Head>

      <div className="pb-8">
        {/* Header with back button */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <Link 
              href="/admin/pets" 
              className="inline-flex items-center text-sm text-amber-600 hover:text-amber-700 mb-2"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="mr-1 w-3 h-3" />
              <span>Quay lại danh sách</span>
            </Link>
            <h1 className="text-2xl font-bold text-slate-800">Thêm thú cưng mới</h1>
          </div>
        </div>
        
        {/* Pet form */}
        <div className="bg-gradient-to-br from-amber-50/50 to-white p-4 md:p-6 rounded-xl">
          <PetForm mode="create" />
        </div>
      </div>
    </AdminLayout>
  );
};

export default CreatePetPage; 