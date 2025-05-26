import React from 'react';
import Head from 'next/head';
import Image from 'next/image';
import MainLayout from '../components/layouts/MainLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faHandHoldingHeart, faPaw, faMedal, faUsers, faHistory } from '@fortawesome/free-solid-svg-icons';

const AboutPage = () => {
  // Team members data
  const teamMembers = [
    {
      name: 'Nguyễn Văn An',
      position: 'Nhà sáng lập & CEO',
      image: '/images/team/team-1.jpg',
      bio: 'Hơn 10 năm kinh nghiệm trong lĩnh vực chăm sóc thú cưng',
    },
    {
      name: 'Trần Thị Bình',
      position: 'Giám đốc Vận hành',
      image: '/images/team/team-2.jpg',
      bio: 'Chuyên gia về quản lý chuỗi cung ứng và chăm sóc khách hàng',
    },
    {
      name: 'Lê Minh Cường',
      position: 'Bác sĩ Thú y trưởng',
      image: '/images/team/team-3.jpg',
      bio: 'Tốt nghiệp Đại học Thú y Hà Nội với hơn 8 năm kinh nghiệm',
    },
    {
      name: 'Phạm Hoài Anh',
      position: 'Giám đốc Marketing',
      image: '/images/team/team-4.jpg',
      bio: 'Chuyên gia trong lĩnh vực marketing số và phát triển thương hiệu',
    },
  ];

  // Milestones data
  const milestones = [
    {
      year: 2015,
      title: 'Thành lập công ty',
      description: 'Monitö được thành lập với cửa hàng đầu tiên tại Quận 1, TP. Hồ Chí Minh.',
      icon: faHistory,
    },
    {
      year: 2017,
      title: 'Mở rộng chuỗi cửa hàng',
      description: 'Mở thêm 3 chi nhánh tại các quận trung tâm TP. Hồ Chí Minh.',
      icon: faPaw,
    },
    {
      year: 2019,
      title: 'Ra mắt dịch vụ trực tuyến',
      description: 'Phát triển nền tảng trực tuyến để khách hàng có thể đặt hàng và tham khảo thông tin.',
      icon: faMedal,
    },
    {
      year: 2021,
      title: 'Mở rộng toàn quốc',
      description: 'Mở rộng hệ thống cửa hàng ra Hà Nội, Đà Nẵng và các tỉnh thành khác.',
      icon: faUsers,
    },
  ];

  return (
    <MainLayout>
      <Head>
        <title>Giới thiệu | Monitö - Cửa hàng thú cưng</title>
        <meta name="description" content="Tìm hiểu về Monitö - Cửa hàng thú cưng hàng đầu tại Việt Nam. Chúng tôi cung cấp các dịch vụ chăm sóc thú cưng chất lượng cao." />
      </Head>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-50 to-amber-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
              Về Cửa hàng Thú cưng <span className="text-amber-500">Monitö</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Chúng tôi là cửa hàng thú cưng hàng đầu tại Việt Nam, mang đến cho bạn những người bạn bốn chân đáng yêu và chất lượng nhất.
            </p>
            <div className="flex justify-center">
              <div className="relative w-24 h-24 bg-amber-400 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                <FontAwesomeIcon 
                  icon={faPaw} 
                  className="text-white text-5xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-800 mb-6">Câu chuyện của chúng tôi</h2>
              <div className="space-y-4">
                <p className="text-gray-600">
                  <strong className="text-amber-500">Monitö</strong> được thành lập năm 2015 với mục tiêu mang đến cho khách hàng những người bạn thú cưng chất lượng cao, khỏe mạnh và được chăm sóc theo tiêu chuẩn quốc tế.
                </p>
                <p className="text-gray-600">
                  Từ một cửa hàng nhỏ tại Quận 1, TP. Hồ Chí Minh, chúng tôi đã phát triển thành chuỗi cửa hàng thú cưng uy tín trên toàn quốc với hơn 15 chi nhánh.
                </p>
                <p className="text-gray-600">
                  Tại <strong className="text-amber-500">Monitö</strong>, chúng tôi không chỉ bán thú cưng mà còn cung cấp dịch vụ chăm sóc sức khỏe, làm đẹp và phụ kiện chất lượng cao cho các bạn thú cưng.
                </p>
              </div>
              <div className="mt-8 flex space-x-4">
                <div className="flex flex-col items-center">
                  <span className="text-4xl font-bold text-amber-500">15+</span>
                  <span className="text-gray-500">Chi nhánh</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-4xl font-bold text-amber-500">8+</span>
                  <span className="text-gray-500">Năm kinh nghiệm</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-4xl font-bold text-amber-500">10k+</span>
                  <span className="text-gray-500">Khách hàng</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg overflow-hidden shadow-lg h-64">
                <img 
                  src="/images/about/about-1.jpg" 
                  alt="Cửa hàng Monitö" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?q=80&w=1470&auto=format&fit=crop';
                  }}
                />
              </div>
              <div className="rounded-lg overflow-hidden shadow-lg h-64 mt-8">
                <img 
                  src="/images/about/about-2.jpg" 
                  alt="Nhân viên Monitö" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1534361960057-19889db9621e?q=80&w=1470&auto=format&fit=crop';
                  }}
                />
              </div>
              <div className="rounded-lg overflow-hidden shadow-lg h-64">
                <img 
                  src="/images/about/about-3.jpg" 
                  alt="Thú cưng tại Monitö" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=1364&auto=format&fit=crop';
                  }}
                />
              </div>
              <div className="rounded-lg overflow-hidden shadow-lg h-64 mt-8">
                <img 
                  src="/images/about/about-4.jpg" 
                  alt="Dịch vụ tại Monitö" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=1471&auto=format&fit=crop';
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              Giá trị cốt lõi của chúng tôi
            </h2>
            <p className="text-gray-600">
              Tại Monitö, chúng tôi hoạt động dựa trên các giá trị cốt lõi này để mang đến dịch vụ tốt nhất cho khách hàng và người bạn thú cưng của họ.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <FontAwesomeIcon icon={faCheckCircle} className="text-amber-600 text-xl" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Chất lượng</h3>
              <p className="text-gray-600">
                Chúng tôi cam kết cung cấp thú cưng khỏe mạnh và các sản phẩm, dịch vụ đạt tiêu chuẩn chất lượng cao nhất.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <FontAwesomeIcon icon={faHandHoldingHeart} className="text-amber-600 text-xl" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Tận tâm</h3>
              <p className="text-gray-600">
                Chúng tôi đặt sự quan tâm và tận tâm lên hàng đầu trong mọi tương tác với khách hàng và thú cưng.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <FontAwesomeIcon icon={faMedal} className="text-amber-600 text-xl" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Chuyên môn</h3>
              <p className="text-gray-600">
                Đội ngũ nhân viên của chúng tôi được đào tạo bài bản và có chuyên môn cao trong lĩnh vực chăm sóc thú cưng.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              Đội ngũ của chúng tôi
            </h2>
            <p className="text-gray-600">
              Gặp gỡ những người đứng sau thành công của Monitö, những người luôn nỗ lực không ngừng để mang đến dịch vụ tốt nhất.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-64 overflow-hidden">
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=FAA&color=fff&size=300`;
                    }}
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-800 mb-1">{member.name}</h3>
                  <p className="text-amber-500 font-medium mb-2">{member.position}</p>
                  <p className="text-gray-600 text-sm">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Milestones */}
      <section className="py-16 bg-gradient-to-r from-amber-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              Hành trình phát triển
            </h2>
            <p className="text-gray-600">
              Nhìn lại quá trình phát triển của Monitö qua các cột mốc quan trọng.
            </p>
          </div>
          
          <div className="space-y-12">
            {milestones.map((milestone, index) => (
              <div 
                key={index}
                className={`flex flex-col md:flex-row ${index % 2 === 1 ? 'md:flex-row-reverse' : ''} gap-6 items-center`}
              >
                <div className="md:w-1/3 flex justify-center">
                  <div className="w-24 h-24 bg-amber-400 rounded-full flex items-center justify-center shadow-lg">
                    <FontAwesomeIcon 
                      icon={milestone.icon} 
                      className="text-white text-3xl"
                    />
                  </div>
                </div>
                <div className="md:w-2/3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-amber-500">{milestone.year}</span>
                    <h3 className="text-2xl font-bold text-slate-800">{milestone.title}</h3>
                  </div>
                  <p className="text-gray-600 mt-2">
                    {milestone.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Sẵn sàng tìm người bạn đồng hành mới?
          </h2>
          <p className="text-gray-300 mb-8 max-w-3xl mx-auto">
            Hãy ghé thăm cửa hàng của chúng tôi hoặc liên hệ ngay hôm nay để được tư vấn và hỗ trợ tốt nhất!
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a 
              href="/pets" 
              className="px-8 py-3 bg-amber-500 text-white rounded-full font-medium hover:bg-amber-600 transition-colors shadow-lg"
            >
              Xem thú cưng
            </a>
            <a 
              href="/contact" 
              className="px-8 py-3 bg-white text-slate-800 rounded-full font-medium hover:bg-gray-100 transition-colors shadow-lg"
            >
              Liên hệ ngay
            </a>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default AboutPage; 