import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../../../../context/AuthContext';
import AdminLayout from '../../../../components/layouts/AdminLayout';
import { getPetById } from '../../../../utils/api';
import { PetForm, PetData } from '../../../../components/ui/pet-form';
import { Card, CardContent } from '../../../../components/ui/card';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

const EditPetPage: NextPage = () => {
  const [pet, setPet] = useState<PetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAdmin } = useAuth();
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    const fetchPet = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const data = await getPetById(id as string);
        setPet(data);
      } catch (err: any) {
        console.error('Error fetching pet:', err);
        setError(err.response?.data?.message || 'Không thể tải thông tin thú cưng.');
      } finally {
        setLoading(false);
      }
    };

    fetchPet();
  }, [id]);

  // Redirect non-admin users
  useEffect(() => {
    if (isAdmin === false) {
      router.push('/');
    }
  }, [isAdmin, router]);

  const handleSuccess = () => {
    router.push('/admin/pets');
  };

  return (
    <AdminLayout>
      <Head>
        <title>Chỉnh sửa thú cưng | Admin</title>
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
            <h1 className="text-2xl font-bold text-slate-800">
              Chỉnh sửa thú cưng {pet?.name && <span className="text-amber-600">{pet.name}</span>}
            </h1>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="bg-gradient-to-br from-amber-50/50 to-white p-4 md:p-6 rounded-xl">
          {loading ? (
            <Card className="border-amber-100 shadow-sm">
              <CardContent className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-500"></div>
                <span className="ml-3 text-slate-600">Đang tải thông tin...</span>
              </CardContent>
            </Card>
          ) : pet ? (
            <PetForm 
              initialData={pet}
              mode="edit" 
              onSuccess={handleSuccess}
            />
          ) : error ? null : (
            <Card className="border-amber-100 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-slate-800 mb-1">Thú cưng không tồn tại</h3>
                <p className="text-slate-500 mb-4">Không tìm thấy thú cưng với ID: {id}</p>
                <Link 
                  href="/admin/pets"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-md transition-colors"
                >
                  Quay lại danh sách
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default EditPetPage; 