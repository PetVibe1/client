import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaw } from "@fortawesome/free-solid-svg-icons";
import FeaturedPets from "../components/home/FeaturedPets";
import MainLayout from "../components/layouts/MainLayout";

export default function Home() {
  const { user, isAdmin } = useAuth();

  return (
    <MainLayout>
      <Head>
        <title>Monitö - Cửa hàng thú cưng</title>
        <meta
          name="description"
          content="Cửa hàng thú cưng Monitö - Thêm một bạn thêm ngàn niềm vui"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        {/* Hero Section */}
        <section className="relative bg-amber-50 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Left content */}
              <div className="z-10">
                <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
                  Thêm Một Bạn
                  <span className="block">Thêm Ngàn Niềm Vui!</span>
                </h1>

                <p className="text-base md:text-lg text-slate-700 mb-8 max-w-lg">
                  Có một con thú cưng đồng nghĩa với việc bạn có thêm niềm vui
                  mới. Chúng tôi có hơn 200 con thú cưng khác nhau có thể đáp
                  ứng nhu cầu của bạn!
                </p>

                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/about"
                    className="inline-flex items-center px-6 py-3 rounded-full border-2 border-slate-800 text-slate-800 font-medium hover:bg-slate-800 hover:text-white transition-colors"
                  >
                    Giới Thiệu <span className="ml-2">&#8594;</span>
                  </Link>
                  <Link
                    href="/pets"
                    className="inline-flex items-center px-6 py-3 rounded-full bg-slate-800 text-white font-medium hover:bg-slate-700 transition-colors"
                  >
                    Khám Phá Ngay
                  </Link>
                </div>
              </div>

              {/* Right content - image */}
              <div className="relative flex justify-center md:justify-end">
                <div className="relative z-10">
                  <div className="w-72 md:w-96 h-72 md:h-96 relative">
                    <Image
                      src="/images/pet.png"
                      alt="Happy person with pet dog"
                      width={400}
                      height={400}
                      className="object-contain w-full h-full"
                      priority
                    />
                  </div>
                </div>
                {/* Large circle background */}
                <div className="absolute w-64 h-64 md:w-80 md:h-80 rounded-full bg-slate-800 -top-10 right-20 z-0"></div>
              </div>
            </div>
          </div>

          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-200 rounded-bl-full opacity-70"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-200 rounded-tr-full opacity-70"></div>
        </section>

        {/* Featured Pets Section */}
        <FeaturedPets />

        {/* Service features */}
        <section className="py-16 bg-amber-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-slate-800 mb-4">
              Dịch vụ của chúng tôi
            </h2>
            <p className="text-center text-slate-600 max-w-3xl mx-auto mb-12">
              Chúng tôi cung cấp các dịch vụ chăm sóc thú cưng toàn diện, từ tư
              vấn chọn thú cưng đến chăm sóc sức khỏe
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-amber-200 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🏠</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  Tư vấn chọn thú cưng
                </h3>
                <p className="text-slate-600">
                  Đội ngũ chuyên gia giàu kinh nghiệm sẽ tư vấn giúp bạn chọn
                  người bạn đồng hành phù hợp nhất.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-amber-200 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">💉</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  Chăm sóc sức khỏe
                </h3>
                <p className="text-slate-600">
                  Dịch vụ khám sức khỏe định kỳ, tiêm phòng và tư vấn dinh dưỡng
                  cho thú cưng của bạn.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-amber-200 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">✂️</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  Làm đẹp thú cưng
                </h3>
                <p className="text-slate-600">
                  Dịch vụ cắt tỉa, tắm rửa và chăm sóc làm đẹp chuyên nghiệp cho
                  thú cưng của bạn.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </MainLayout>
  );
}
