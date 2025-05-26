import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface PetItemProps {
  id: string;
  code: string;
  name: string;
  gender: string;
  age: number;
  price: number;
  imageUrl: string;
}

const PetItem: React.FC<PetItemProps> = ({
  id,
  code,
  name,
  gender,
  age,
  price,
  imageUrl
}) => {
  // Format giá tiền theo định dạng Việt Nam
  const formattedPrice = new Intl.NumberFormat('vi-VN').format(price);
  
  return (
    <Link href={`/pets/${id}`} className="block">
      <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
        <div className="relative h-64 w-full">
          {imageUrl.startsWith("https://") ? (
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Image
              src={imageUrl}
              alt={name}
              width={400}
              height={300}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        <div className="p-4">
          <h3 className="font-bold text-[#00171F] font-[900]">
            {code} - {name}
          </h3>

          <div className="mt-2 text-sm text-gray-600 space-y-1">
            <div className="flex items-center space-x-1">
              <span>Giống:</span>
              <span className="font-medium text-[#667479] font-[900]">{gender}</span>
            </div>

            <div className="flex items-center space-x-1">
              <span>Tuổi:</span>
              <span className="font-medium text-[#667479] font-[900]">{age} tháng</span>
            </div>
          </div>

          <div className="mt-3 font-bold text-[#00171F] font-[900]">
            {formattedPrice} VND
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PetItem; 