"use client";

import { useState } from "react";
import { m } from "framer-motion";
import {
	Mail,
	Phone,
	MapPin,
	Send,
	MessageCircle,
	Building,
	Globe,
} from "lucide-react";
import MainButton from "@/components/MainButton";
import { DotPattern } from "@/components/landing-page/dot-pattern";
import SimpleNavbar from "@/components/landing-page/SimpleNavbar";

interface ContactForm {
	name: string;
	email: string;
	company: string;
	subject: string;
	message: string;
}

const contactMethods = [
	{
		icon: <Mail className="w-6 h-6 text-[#7f2dfb]" />,
		title: "البريد الإلكتروني",
		value: "support@bilfora.com",
		description: "راسلنا عبر البريد الإلكتروني",
	},
	{
		icon: <Phone className="w-6 h-6 text-[#7f2dfb] rtl" />,
		title: "الهاتف",
		value: (
			<span className="inline-flex items-center gap-1">
				<span className="text-gray-500">قريبًا</span>
				<span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs">غير متوفر حالياً</span>
			</span>
		),
		description: "سيتم إضافة رقم الهاتف قريبًا",
		disabled: true,
	},
	{
		icon: <MapPin className="w-6 h-6 text-[#7f2dfb]" />,
		title: "العنوان",
		value: "الرياض، المملكة العربية السعودية",
		description: "مقر الشركة الرئيسي",
	},
];

const supportCategories = [
	{ name: "الدعم الفني", icon: <MessageCircle className="w-5 h-5" /> },
	{ name: "المبيعات", icon: <Building className="w-5 h-5" /> },
	{ name: "الشكاوى", icon: <MessageCircle className="w-5 h-5" /> },
	{ name: "الاقتراحات", icon: <Globe className="w-5 h-5" /> },
];

export default function ContactPage() {
	const [formData, setFormData] = useState<ContactForm>({
		name: "",
		email: "",
		company: "",
		subject: "",
		message: "",
	});
	const [selectedCategory, setSelectedCategory] = useState("الدعم الفني");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		setFormData((prev) => ({
			...prev,
			[e.target.name]: e.target.value,
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		await new Promise((resolve) => setTimeout(resolve, 2000));

		setFormData({
			name: "",
			email: "",
			company: "",
			subject: "",
			message: "",
		});
		setSelectedCategory("الدعم الفني");
		setIsSubmitting(false);
		alert("تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.");
	};

	return (
		<div className="min-h-screen bg-white relative overflow-hidden">
			{/* soft shiny gradient from bottom-right */}
			<div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-gradient-to-tl from-[#7f2dfb]/30 via-[#ff6b9d]/20 to-transparent blur-3xl rounded-full opacity-70 pointer-events-none" />
			<DotPattern className="absolute inset-0 opacity-[0.04]" />

			<SimpleNavbar />

			{/* Header */}
			<div className="relative z-10 pt-24 pb-16 px-4 sm:px-6 lg:px-8 text-center">
				<m.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					className="max-w-4xl mx-auto"
				>
					<div className="inline-flex items-center justify-center w-16 h-16 bg-[#7f2dfb]/10 rounded-full mb-6">
						<MessageCircle className="w-8 h-8 text-[#7f2dfb]" />
					</div>
					<h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
						تواصل معنا
					</h1>
					<p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
						نحن هنا لمساعدتك! تواصل مع فريق الدعم الفني للحصول على
						المساعدة التي تحتاجها
					</p>
				</m.div>
			</div>

			{/* Contact Methods */}
			<div className="relative z-10 px-4 sm:px-6 lg:px-8 mb-12">
				<m.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.2 }}
					className="max-w-6xl mx-auto"
				>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{contactMethods.map((method, index) => (
							<m.div
								key={method.title}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{
									duration: 0.6,
									delay: 0.3 + index * 0.1,
								}}
								className="bg-white border border-gray-100 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-all duration-200"
							>
								<div className="inline-flex items-center justify-center w-12 h-12 bg-[#7f2dfb]/10 rounded-full mb-4">
									{method.icon}
								</div>
								<h3 className="text-lg font-semibold text-gray-900 mb-2">
									{method.title}
								</h3>
								<p className="text-[#7f2dfb] font-medium mb-2">
									{method.value}
								</p>
								<p className="text-gray-600 text-sm">
									{method.description}
								</p>
							</m.div>
						))}
					</div>
				</m.div>
			</div>

			{/* Contact Form */}
			<div className="relative z-10 px-4 sm:px-6 lg:px-8 pb-20">
				<m.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.4 }}
					className="max-w-4xl mx-auto"
				>
					<div className="bg-white border border-gray-100 rounded-3xl p-8 md:p-12 shadow-sm">
						<div className="text-center mb-8">
							<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
								راسلنا
							</h2>
							<p className="text-lg text-gray-600">
								سنرد عليك في أقرب وقت ممكن
							</p>
						</div>

						{/* Category Selection */}
						<div className="mb-8">
							<label className="block text-gray-900 font-semibold mb-4 text-right">
								نوع الاستفسار
							</label>
							<div className="flex flex-wrap gap-3 justify-center">
								{supportCategories.map((category) => (
									<button
										key={category.name}
										onClick={() =>
											setSelectedCategory(category.name)
										}
										className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-200 ${
											selectedCategory === category.name
												? "bg-[#7f2dfb] text-white shadow-lg"
												: "bg-gray-100 text-gray-700 hover:bg-gray-200"
										}`}
									>
										{category.icon}
										{category.name}
									</button>
								))}
							</div>
						</div>

						<form onSubmit={handleSubmit} className="space-y-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<label className="block text-gray-900 font-semibold mb-2 text-right">
										الاسم الكامل *
									</label>
									<input
										type="text"
										name="name"
										value={formData.name}
										onChange={handleInputChange}
										required
										className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7f2dfb]/40 focus:border-transparent transition-all duration-200"
										placeholder="أدخل اسمك الكامل"
									/>
								</div>

								<div>
									<label className="block text-gray-900 font-semibold mb-2 text-right">
										البريد الإلكتروني *
									</label>
									<input
										type="email"
										name="email"
										value={formData.email}
										onChange={handleInputChange}
										required
										className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7f2dfb]/40 focus:border-transparent transition-all duration-200"
										placeholder="أدخل بريدك الإلكتروني"
									/>
								</div>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<label className="block text-gray-900 font-semibold mb-2 text-right">
										اسم الشركة
									</label>
									<input
										type="text"
										name="company"
										value={formData.company}
										onChange={handleInputChange}
										className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7f2dfb]/40 focus:border-transparent transition-all duration-200"
										placeholder="أدخل اسم شركتك (اختياري)"
									/>
								</div>

								<div>
									<label className="block text-gray-900 font-semibold mb-2 text-right">
										الموضوع *
									</label>
									<input
										type="text"
										name="subject"
										value={formData.subject}
										onChange={handleInputChange}
										required
										className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7f2dfb]/40 focus:border-transparent transition-all duration-200"
										placeholder="أدخل موضوع الرسالة"
									/>
								</div>
							</div>

							<div>
								<label className="block text-gray-900 font-semibold mb-2 text-right">
									الرسالة *
								</label>
								<textarea
									name="message"
									value={formData.message}
									onChange={handleInputChange}
									required
									rows={6}
									className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7f2dfb]/40 focus:border-transparent transition-all duration-200 resize-none"
									placeholder="اكتب رسالتك هنا..."
								/>
							</div>

							<div className="text-center pt-4">
								<MainButton
									text={
										isSubmitting
											? "جاري الإرسال..."
											: "إرسال الرسالة"
									}
									bgColor="bg-[#7f2dfb]"
									textColor="text-white"
									hoverBgColor="hover:bg-[#6a1fd8]"
									className="text-lg px-12 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
									disabled={isSubmitting}
									rightIcon={
										!isSubmitting ? (
											<Send className="w-5 h-5" />
										) : undefined
									}
								/>
							</div>
						</form>
					</div>
				</m.div>
			</div>
		</div>
	);
}
