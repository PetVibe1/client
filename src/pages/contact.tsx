import React, { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import MainLayout from '../components/layouts/MainLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import emailjs from '@emailjs/browser';
import { 
  faMapMarkerAlt, 
  faPhone, 
  faEnvelope, 
  faClock, 
  faPaperPlane, 
  faCheckCircle,
  faExclamationTriangle,
  faPaw
} from '@fortawesome/free-solid-svg-icons';
import { 
  faFacebookF, 
  faTwitter, 
  faInstagram, 
  faTiktok 
} from '@fortawesome/free-brands-svg-icons';

// Thay thế các giá trị này bằng thông tin từ tài khoản EmailJS của bạn
const EMAILJS_SERVICE_ID = "service_3uj67fc";
const EMAILJS_TEMPLATE_ID = "template_mb8rl0i";
const EMAILJS_PUBLIC_KEY = "jED_F9oRqLy0yK6_z";

const ContactPage = () => {
  const form = useRef<HTMLFormElement>(null);
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  
  const [formStatus, setFormStatus] = useState({
    submitted: false,
    success: false,
    error: null as string | null
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Store locations data
  const locations = [
    {
      name: 'Cửa hàng TP. Hồ Chí Minh',
      address: '123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh',
      phone: '(028) 1234 5678',
      email: 'hcm@monito.com',
      hours: 'Thứ 2 - Chủ nhật: 8:00 - 20:00',
      mapLink: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15677.62620120536!2d106.69158272431765!3d10.775481541147396!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f4b3330bcc7%3A0x4db964d76bf6e18e!2zUXXhuq1uIDEsIFRow6BuaCBwaOG7kSBI4buTIENow60gTWluaCwgVmnhu4d0IE5hbQ!5e0!3m2!1svi!2s!4v1658482489937!5m2!1svi!2s',
      isMain: true
    },
    {
      name: 'Cửa hàng Hà Nội',
      address: '45 Phố Hàng Bài, Quận Hoàn Kiếm, Hà Nội',
      phone: '(024) 9876 5432',
      email: 'hanoi@monito.com',
      hours: 'Thứ 2 - Chủ nhật: 8:00 - 20:00',
      mapLink: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.126723146943!2d105.85251997601517!3d21.023554880620916!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135abec902b9623%3A0x51df1cc4513e09b8!2zSMOgbmcgQsOgaSwgSG_DoG4gS2nhur9tLCBIw6AgTuG7mWksIFZp4buHdCBOYW0!5e0!3m2!1svi!2s!4v1658483222019!5m2!1svi!2s',
      isMain: false
    },
    {
      name: 'Cửa hàng Đà Nẵng',
      address: '56 Đường Bạch Đằng, Quận Hải Châu, Đà Nẵng',
      phone: '(0236) 3456 7890',
      email: 'danang@monito.com',
      hours: 'Thứ 2 - Chủ nhật: 8:00 - 20:00',
      mapLink: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3834.1364688246978!2d108.22121897585641!3d16.071772084624322!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x314218314e1f000d%3A0xdc77936d16e47a74!2zxJAuIELhuqFjaCDEkOG6sW5nLCBI4bqjaSBDaMOidSwgxJDDoCBO4bq1bmcsIFZp4buHdCBOYW0!5e0!3m2!1svi!2s!4v1658483434919!5m2!1svi!2s',
      isMain: false
    }
  ];
  
  // Social media links
  const socialLinks = [
    { name: 'Facebook', icon: faFacebookF, url: 'https://facebook.com' },
    { name: 'Twitter', icon: faTwitter, url: 'https://twitter.com' },
    { name: 'Instagram', icon: faInstagram, url: 'https://instagram.com' },
    { name: 'TikTok', icon: faTiktok, url: 'https://tiktok.com' }
  ];

  // Form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Map input names to state fields
    const fieldMap: {[key: string]: string} = {
      user_name: 'name',
      user_email: 'email',
      user_phone: 'phone',
      subject: 'subject',
      message: 'message'
    };
    
    const stateField = fieldMap[name] || name;
    
    setFormData(prevState => ({
      ...prevState,
      [stateField]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Validate form
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setFormStatus({
        submitted: true,
        success: false,
        error: 'Vui lòng điền đầy đủ thông tin bắt buộc (Họ tên, Email và Nội dung)'
      });
      setIsSubmitting(false);
      return;
    }
    
    try {
      // Cập nhật form với dữ liệu từ state để đảm bảo dữ liệu được gửi đi
      if (form.current) {
        // Set form field values to ensure they match the state
        const formElement = form.current;
        const nameInput = formElement.querySelector('[name="user_name"]') as HTMLInputElement;
        const emailInput = formElement.querySelector('[name="user_email"]') as HTMLInputElement;
        const phoneInput = formElement.querySelector('[name="user_phone"]') as HTMLInputElement;
        const subjectInput = formElement.querySelector('[name="subject"]') as HTMLSelectElement;
        const messageInput = formElement.querySelector('[name="message"]') as HTMLTextAreaElement;
        
        if (nameInput) nameInput.value = formData.name;
        if (emailInput) emailInput.value = formData.email;
        if (phoneInput) phoneInput.value = formData.phone;
        if (subjectInput) subjectInput.value = formData.subject;
        if (messageInput) messageInput.value = formData.message;
        
        // Thêm thời gian cho template email
        const now = new Date();
        const formattedTime = now.toLocaleString('vi-VN', {
          year: 'numeric', 
          month: 'numeric', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        
        // Kiểm tra nếu đã có input time trước đó thì xóa đi
        const existingTimeInput = formElement.querySelector('[name="time"]');
        if (existingTimeInput) {
          existingTimeInput.remove();
        }
        
        // Thêm input time mới
        const timeInput = document.createElement('input');
        timeInput.type = 'hidden';
        timeInput.name = 'time';
        timeInput.value = formattedTime;
        formElement.appendChild(timeInput);
        
        // Sử dụng EmailJS để gửi form
        const result = await emailjs.sendForm(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          form.current,
          EMAILJS_PUBLIC_KEY
        );
        
        console.log('Email sent successfully:', result.text);
        
        // Success response
        setFormStatus({
          submitted: true,
          success: true,
          error: null
        });
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
      }
    } catch (error: any) {
      console.error('Email sending failed:', error);
      setFormStatus({
        submitted: true,
        success: false,
        error: 'Có lỗi xảy ra khi gửi thông tin. Vui lòng thử lại sau!'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add custom styling for placeholder text
  useEffect(() => {
    // Add a style tag to the document head
    const styleTag = document.createElement('style');
    styleTag.innerHTML = `
      input::placeholder, 
      textarea::placeholder,
      select {
        color: #000000 !important;
        opacity: 0.7 !important;
      }
      input, textarea, select, option {
        color: #000000 !important;
        font-weight: 500 !important;
      }
    `;
    document.head.appendChild(styleTag);

    return () => {
      document.head.removeChild(styleTag);
    };
  }, []);

  return (
    <MainLayout>
      <Head>
        <title>Liên hệ | Monitö - Cửa hàng thú cưng</title>
        <meta name="description" content="Liên hệ với Monitö - Cửa hàng thú cưng hàng đầu tại Việt Nam. Liên hệ với chúng tôi để được tư vấn và hỗ trợ." />
      </Head>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-50 to-amber-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
              Liên hệ với <span className="text-amber-500">Monitö</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy liên hệ với chúng tôi nếu bạn có bất kỳ câu hỏi hoặc thắc mắc nào.
            </p>
            <div className="flex justify-center">
              <div className="relative w-16 h-16 bg-amber-400 rounded-full flex items-center justify-center mb-4 shadow-md">
                <FontAwesomeIcon 
                  icon={faPaw} 
                  className="text-white text-3xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info & Form */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="bg-gradient-to-br from-blue-50 to-amber-50 p-6 rounded-xl shadow-md md:col-span-1">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Thông tin liên hệ</h2>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mr-4 shrink-0">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 mb-1">Địa chỉ</h3>
                    <p className="text-gray-600">123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mr-4 shrink-0">
                    <FontAwesomeIcon icon={faPhone} className="text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 mb-1">Số điện thoại</h3>
                    <p className="text-gray-600">(028) 1234 5678</p>
                    <p className="text-gray-600">Đường dây nóng: 1900 1234</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mr-4 shrink-0">
                    <FontAwesomeIcon icon={faEnvelope} className="text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 mb-1">Email</h3>
                    <p className="text-gray-600">info@monito.com</p>
                    <p className="text-gray-600">cskh@monito.com</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mr-4 shrink-0">
                    <FontAwesomeIcon icon={faClock} className="text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 mb-1">Giờ làm việc</h3>
                    <p className="text-gray-600">Thứ 2 - Thứ 6: 8:00 - 20:00</p>
                    <p className="text-gray-600">Thứ 7 & Chủ nhật: 9:00 - 21:00</p>
                  </div>
                </div>
              </div>
              
              {/* Social Media Links */}
              <div className="mt-8">
                <h3 className="font-bold text-slate-800 mb-4">Theo dõi chúng tôi</h3>
                <div className="flex space-x-4">
                  {socialLinks.map((social, index) => (
                    <a 
                      key={index} 
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-amber-100 hover:bg-amber-200 rounded-full flex items-center justify-center transition-colors"
                    >
                      <FontAwesomeIcon icon={social.icon} className="text-amber-600" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Contact Form */}
            <div className="md:col-span-2">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Gửi tin nhắn cho chúng tôi</h2>
              
              {formStatus.submitted && formStatus.success && (
                <div className="mb-6 bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg flex items-start">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 mt-1 mr-3" />
                  <div>
                    <h3 className="font-bold">Gửi tin nhắn thành công!</h3>
                    <p>Cảm ơn bạn đã liên hệ với chúng tôi. Chúng tôi sẽ phản hồi trong thời gian sớm nhất.</p>
                  </div>
                </div>
              )}
              
              {formStatus.submitted && !formStatus.success && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-start">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 mt-1 mr-3" />
                  <div>
                    <h3 className="font-bold">Không thể gửi tin nhắn</h3>
                    <p>{formStatus.error}</p>
                  </div>
                </div>
              )}
              
              <form ref={form} onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="user_name" className="block text-sm font-medium text-gray-700 mb-1">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="user_name"
                      name="user_name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="Nhập họ và tên của bạn"
                      style={{ color: '#000000', fontWeight: 500 }}
                    />
                  </div>
                  <div>
                    <label htmlFor="user_email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="user_email"
                      name="user_email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="Nhập email của bạn"
                      style={{ color: '#000000', fontWeight: 500 }}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="user_phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      id="user_phone"
                      name="user_phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="Nhập số điện thoại của bạn"
                      style={{ color: '#000000', fontWeight: 500 }}
                    />
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                      Chủ đề
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      style={{ color: '#000000', fontWeight: 500 }}
                    >
                      <option value="" style={{ color: '#000000', fontWeight: 500 }}>-- Chọn chủ đề --</option>
                      <option value="Tư vấn mua thú cưng" style={{ color: '#000000', fontWeight: 500 }}>Tư vấn mua thú cưng</option>
                      <option value="Dịch vụ chăm sóc" style={{ color: '#000000', fontWeight: 500 }}>Dịch vụ chăm sóc</option>
                      <option value="Phụ kiện thú cưng" style={{ color: '#000000', fontWeight: 500 }}>Phụ kiện thú cưng</option>
                      <option value="Khiếu nại" style={{ color: '#000000', fontWeight: 500 }}>Khiếu nại</option>
                      <option value="Hợp tác kinh doanh" style={{ color: '#000000', fontWeight: 500 }}>Hợp tác kinh doanh</option>
                      <option value="Khác" style={{ color: '#000000', fontWeight: 500 }}>Khác</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Nội dung tin nhắn <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={5}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Nhập nội dung tin nhắn của bạn"
                    style={{ color: '#000000', fontWeight: 500 }}
                  ></textarea>
                </div>
                
                <div className="text-right">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-amber-500 text-white rounded-full font-medium hover:bg-amber-600 transition-colors shadow-md flex items-center ml-auto"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Đang gửi...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faPaperPlane} className="mr-2" />
                        Gửi tin nhắn
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Store Locations */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              Hệ thống cửa hàng
            </h2>
            <p className="text-gray-600">
              Chúng tôi có mặt tại nhiều thành phố lớn trên cả nước để phục vụ bạn tốt nhất.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {locations.map((location, index) => (
              <div 
                key={index} 
                className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow ${
                  location.isMain ? 'border-2 border-amber-500' : ''
                }`}
              >
                <div className="h-56">
                  <iframe 
                    src={location.mapLink} 
                    className="w-full h-full border-0" 
                    allowFullScreen 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    title={location.name}
                  ></iframe>
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <h3 className="text-xl font-bold text-slate-800 mb-3">{location.name}</h3>
                    {location.isMain && (
                      <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full font-medium">
                        Cửa hàng chính
                      </span>
                    )}
                  </div>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="text-amber-500 mt-1 mr-2" />
                      <span>{location.address}</span>
                    </li>
                    <li className="flex items-start">
                      <FontAwesomeIcon icon={faPhone} className="text-amber-500 mt-1 mr-2" />
                      <span>{location.phone}</span>
                    </li>
                    <li className="flex items-start">
                      <FontAwesomeIcon icon={faEnvelope} className="text-amber-500 mt-1 mr-2" />
                      <span>{location.email}</span>
                    </li>
                    <li className="flex items-start">
                      <FontAwesomeIcon icon={faClock} className="text-amber-500 mt-1 mr-2" />
                      <span>{location.hours}</span>
                    </li>
                  </ul>
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
            Hãy đến thăm cửa hàng của chúng tôi ngay hôm nay
          </h2>
          <p className="text-gray-300 mb-8 max-w-3xl mx-auto">
            Chúng tôi luôn chào đón bạn tại các cửa hàng trên toàn quốc với đội ngũ nhân viên chuyên nghiệp và thân thiện.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a 
              href="tel:02812345678" 
              className="px-8 py-3 bg-amber-500 text-white rounded-full font-medium hover:bg-amber-600 transition-colors shadow-lg flex items-center justify-center"
            >
              <FontAwesomeIcon icon={faPhone} className="mr-2" />
              Gọi ngay
            </a>
            <a 
              href="mailto:info@monito.com" 
              className="px-8 py-3 bg-white text-slate-800 rounded-full font-medium hover:bg-gray-100 transition-colors shadow-lg flex items-center justify-center"
            >
              <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
              Gửi email
            </a>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default ContactPage; 