"use client";

import { Palette, Code, TrendingUp, Calculator } from "lucide-react";

export function Logos() {
  const audiences = [
    { icon: Palette, title: "مصممين", subtitle: "جرافيك • UI/UX" },
    { icon: Code, title: "مطورين", subtitle: "ويب • تطبيقات" },
    { icon: TrendingUp, title: "مستشارين", subtitle: "إدارة • تسويق" },
    { icon: Calculator, title: "محاسبين", subtitle: "مستقلين" },
  ];

  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h2 className="text-center text-lg font-semibold leading-8 text-gray-500 mb-8">
          صُمّم خصيصاً لـ <span className="text-[#7f2dfb] font-bold">المستقلين وأصحاب المشاريع الصغيرة</span>
        </h2>
        <div className="flex items-center justify-center gap-4 sm:gap-6 flex-wrap">
          {audiences.map((item, index) => (
            <div
              key={index}
              className="text-center px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl hover:bg-purple-50 hover:border-purple-100 transition-all group"
            >
              <div className="flex justify-center mb-2">
                <item.icon className="h-6 w-6 text-gray-400 group-hover:text-[#7f2dfb] transition-colors" />
              </div>
              <p className="text-xl font-bold text-gray-700 group-hover:text-[#7f2dfb] transition-colors">
                {item.title}
              </p>
              <p className="text-sm text-gray-500">{item.subtitle}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-gray-400 mt-6">
          سواء كنت في الرياض أو جدة أو أي مكان في العالم العربي
        </p>
      </div>
    </section>
  );
}
