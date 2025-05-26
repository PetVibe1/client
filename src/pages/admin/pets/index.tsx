import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../../context/AuthContext';
import AdminLayout from '../../../components/layouts/AdminLayout';
import { getAllPets, deletePet } from '../../../utils/api';
import { PetData } from '../../../components/ui/pet-form';
import { DataTable } from '../../../components/ui/data-table';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { SearchInput } from '../../../components/ui/search-input';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle, faEdit, faTrash, faEye } from '@fortawesome/free-solid-svg-icons';
import { formatCurrency } from '../../../lib/utils';
import { Card, CardContent } from '../../../components/ui/card';

const PetsListPage: NextPage = () => {
  const [pets, setPets] = useState<PetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAdmin } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPets, setFilteredPets] = useState<PetData[]>([]);

  // Fetch pets from API
  const fetchPets = async () => {
    try {
      setLoading(true);
      const response = await getAllPets();
      const petsData = response.pets || response; // Handle both formats
      setPets(petsData);
      setFilteredPets(petsData);
    } catch (err: any) {
      console.error('Error fetching pets:', err);
      setError(err.response?.data?.message || 'Không thể tải danh sách thú cưng.');
    } finally {
      setLoading(false);
    }
  };

  // Load pets on mount
  useEffect(() => {
    fetchPets();
  }, []);

  // Filter pets based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredPets(pets);
      return;
    }
    
    const lowerCaseSearch = searchTerm.toLowerCase();
    const filtered = pets.filter(pet => 
      pet.name?.toLowerCase().includes(lowerCaseSearch) || 
      pet.code?.toLowerCase().includes(lowerCaseSearch) ||
      pet.species?.toLowerCase().includes(lowerCaseSearch) ||
      pet.breed?.toLowerCase().includes(lowerCaseSearch)
    );
    
    setFilteredPets(filtered);
  }, [searchTerm, pets]);

  // Redirect non-admin users
  useEffect(() => {
    if (isAdmin === false) {
      router.push('/');
    }
  }, [isAdmin, router]);

  // Handle pet deletion
  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thú cưng này không?')) {
      return;
    }

    try {
      await deletePet(id);
      await fetchPets(); // Refresh the list
      alert('Đã xóa thú cưng thành công.');
    } catch (err: any) {
      console.error('Error deleting pet:', err);
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi xóa thú cưng.');
    }
  };

  // Define columns for the data table
  const columns = [
    { 
      header: 'Mã', 
      accessorKey: 'code' as keyof PetData,
      cell: (pet: PetData) => (
        <span className="font-medium text-slate-800">
          {pet.code}
        </span>
      ),
      responsiveLabel: 'Mã',
      showInResponsiveCard: true
    },
    { 
      header: 'Tên', 
      accessorKey: 'name' as keyof PetData,
      cell: (pet: PetData) => (
        <div className="font-medium text-slate-800">{pet.name}</div>
      ),
      responsiveLabel: 'Tên',
      showInResponsiveCard: true
    },
    { 
      header: 'Loài/Giống', 
      accessorKey: 'species' as keyof PetData,
      cell: (pet: PetData) => (
        <div>
          <div className="text-slate-800">{pet.species}</div>
          {pet.breed && (
            <div className="text-xs text-slate-500 mt-1">{pet.breed}</div>
          )}
        </div>
      ),
      responsiveLabel: 'Loài/Giống',
      showInResponsiveCard: true
    },
    { 
      header: 'Giá', 
      accessorKey: 'price' as keyof PetData,
      cell: (pet: PetData) => (
        <span className="font-medium text-amber-700">
          {pet.price !== null ? formatCurrency(pet.price) : '—'}
        </span>
      ),
      responsiveLabel: 'Giá',
      showInResponsiveCard: true
    },
    { 
      header: 'Trạng thái', 
      accessorKey: 'available' as keyof PetData,
      cell: (pet: PetData) => (
        <Badge
          variant={pet.available ? "primary" : "secondary"}
          withDot={true}
          size="md"
        >
          {pet.available ? 'Còn hàng' : 'Đã bán'}
        </Badge>
      ),
      responsiveLabel: 'Trạng thái',
      showInResponsiveCard: true
    },
    { 
      header: 'Thao tác', 
      accessorKey: '_id' as keyof PetData,
      cell: (pet: PetData) => (
        <div className="flex space-x-1">
          <Link 
            href={`/pets/${pet._id}`}
            className="p-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
            title="Xem chi tiết"
          >
            <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
          </Link>
          <Link 
            href={`/admin/pets/${pet._id}/edit`}
            className="p-1.5 bg-amber-50 text-amber-600 rounded-md hover:bg-amber-100 transition-colors"
            title="Chỉnh sửa"
          >
            <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
          </Link>
          <button
            onClick={() => pet._id && handleDelete(pet._id)}
            className="p-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
            title="Xóa"
          >
            <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
          </button>
        </div>
      ),
      responsiveLabel: 'Thao tác',
      showInResponsiveCard: true
    },
  ];

  return (
    <AdminLayout>
      <Head>
        <title>Quản lý thú cưng | Admin</title>
      </Head>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Quản lý thú cưng</h1>
        <Link href="/admin/pets/create">
          <Button 
            variant="default" 
            size="md" 
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
          >
            <FontAwesomeIcon icon={faPlusCircle} />
            <span>Thêm thú cưng</span>
          </Button>
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="mb-6">
        <SearchInput 
          placeholder="Tìm kiếm theo tên, mã, loài, giống..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="md"
          variant="default"
          clearable={true}
        />
        {searchTerm && (
          <div className="mt-1 text-xs flex items-center gap-2 pl-2">
            <span className="text-slate-500">
              {filteredPets.length > 0 
                ? `Tìm thấy ${filteredPets.length} kết quả` 
                : 'Không tìm thấy kết quả nào'}
            </span>
            {filteredPets.length > 0 && (
              <span className="inline-flex h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <Card>
          <CardContent className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-500"></div>
          </CardContent>
        </Card>
      ) : (
        <DataTable
          title="Danh sách thú cưng"
          columns={columns}
          data={filteredPets}
          emptyMessage="Không có thú cưng nào trong cơ sở dữ liệu."
        />
      )}
    </AdminLayout>
  );
};

export default PetsListPage; 