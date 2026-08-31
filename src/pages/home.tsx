import { useEffect, useRef, useState } from "react";
import { useAssets } from "@/hooks/use-assets";
import {
	bySlotNumber,
	gallerySlots,
	isFixedSlot,
	testimonialSlots,
} from "@/lib/slots";
import {
	ArrowLeft,
	Check,
	Dumbbell,
	Maximize2,
	Menu,
	MessageCircle,
	Minus,
	Pause,
	Play,
	Plus,
	Sparkles,
	Utensils,
	X,
} from "lucide-react";
import { FaFacebookF, FaInstagram, FaTiktok } from "react-icons/fa";

export function Home() {
	const [menuOpen, setMenuOpen] = useState(false);
	const [lightbox, setLightbox] = useState<{
		src: string;
		label: string;
	} | null>(null);
	const [openFaq, setOpenFaq] = useState<number | null>(0);

	const whatsappBase = "https://wa.me/201000257565";
	const messages = {
		training: "السلام عليكم، عايز اشترك في باقة التدريب والتغذية 799 جنيه",
		nutrition: "السلام عليكم، عايز اشترك في باقة التغذية فقط 599 جنيه",
		general: "السلام عليكم، عايز استفسر عن التدريب اونلاين",
	};
	const whatsapp = (message: string) =>
		`${whatsappBase}?text=${encodeURIComponent(message)}`;
	const goTo = (id: string) => {
		setMenuOpen(false);
		document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
	};

	const { data: assetsBySlot } = useAssets();
	const extraAssets = Object.values(assetsBySlot ?? {}).filter(
		(asset) => !isFixedSlot(asset.slot),
	);
	const extraGalleryUrls = extraAssets
		.filter((asset) => asset.type === "image")
		.sort(bySlotNumber)
		.map((asset) => asset.url);
	const extraTestimonialUrls = extraAssets
		.filter((asset) => asset.type === "voicenote")
		.sort(bySlotNumber)
		.map((asset) => asset.url);

	const transformations = [
		...gallerySlots.map(
			(slotDef) => assetsBySlot?.[slotDef.slot]?.url ?? slotDef.fallback,
		),
		...extraGalleryUrls,
	];
	const audioFiles = [
		...testimonialSlots.map(
			(slotDef) => assetsBySlot?.[slotDef.slot]?.url ?? slotDef.fallback,
		),
		...extraTestimonialUrls,
	];

	return (
		<div className="shabaan-app" dir="rtl">
			<header className="site-nav">
				<div className="container-shell nav-inner">
					<button
						className="menu-toggle"
						onClick={() => setMenuOpen((value) => !value)}
						aria-label={menuOpen ? "اغلاق القائمة" : "فتح القائمة"}
						aria-expanded={menuOpen}
						data-testid="button-mobile-menu"
					>
						{menuOpen ? <X size={25} /> : <Menu size={25} />}
					</button>
					<img
						className="brand-logo"
						src="/assets/shabaan-logo.webp"
						alt="شعار شعبان SHABAAN"
						data-testid="img-header-logo"
					/>
					<nav
						className={`nav-links ${menuOpen ? "open" : ""}`}
						aria-label="التنقل الرئيسي"
					>
						<a
							href="#home"
							onClick={() => goTo("home")}
							data-testid="link-home"
						>
							الرئيسية
						</a>
						<a
							href="#plans"
							onClick={() => goTo("plans")}
							data-testid="link-plans"
						>
							الباقات
						</a>
						<a
							href="#results"
							onClick={() => goTo("results")}
							data-testid="link-results"
						>
							النتائج
						</a>
						<a
							href="#voices"
							onClick={() => goTo("voices")}
							data-testid="link-voices"
						>
							تجارب العملاء
						</a>
						<a
							href="#contact"
							onClick={() => goTo("contact")}
							data-testid="link-contact"
						>
							تواصل معنا
						</a>
					</nav>
					<a
						className="nav-cta"
						href={whatsapp(messages.training)}
						target="_blank"
						rel="noreferrer"
						data-testid="link-nav-subscribe"
					>
						اشترك دلوقتي <ArrowLeft size={16} />
					</a>
				</div>
			</header>

			<main>
				<section id="home" className="hero">
					<div className="container-shell">
						<div className="hero-content reveal">
							<div className="hero-mark">ONLINE TRAINING &amp; NUTRITION</div>
							<h1 className="hero-title">
								غير جسمك
								<br />
								<em>غير حياتك</em>
							</h1>
							<p className="hero-desc">
								تدريب أونلاين مبني على خطة تناسب هدفك، متابعة مستمرة، وتعديلات
								عملية تساعدك تشوف تقدمك خطوة وراء خطوة.
							</p>
							<div className="hero-actions">
								<a
									className="button-primary"
									href={whatsapp(messages.training)}
									target="_blank"
									rel="noreferrer"
									data-testid="link-hero-subscribe"
								>
									ابدأ خطتك <ArrowLeft size={17} />
								</a>
								<a
									className="button-outline"
									href="#plans"
									onClick={() => goTo("plans")}
									data-testid="link-hero-plans"
								>
									شوف الباقات
								</a>
							</div>
							<div className="hero-meta" aria-label="معلومات الخدمة">
								<div>
									<strong>01</strong>خطة واضحة
								</div>
								<div>
									<strong>02</strong>متابعة مستمرة
								</div>
								<div>
									<strong>03</strong>تقدم تقدر تلاحظه
								</div>
							</div>
						</div>
					</div>
					<span className="scroll-note">SCROLL TO FOCUS</span>
				</section>

				<section className="section about-band" id="about">
					<div className="container-shell about-grid">
						<div>
							<div className="eyebrow">الفكرة ببساطة</div>
							<p className="about-quote">
								مش مجرد جدول تمرين، دي <strong>متابعة كاملة</strong> لهدفك.
							</p>
							<p className="section-copy">
								مع SHABAAN هتلاقي خطة تدريب وتغذية حسب الباقة اللي تختارها،
								وتوجيه مستمر يخلي كل خطوة في مكانها. نشتغل على اللي تقدر تلتزم
								به فعلا.
							</p>
						</div>
						<div className="about-points">
							<div className="about-point">
								<span className="point-icon">
									<Dumbbell size={16} />
								</span>
								<div>
									<strong>تدريب مناسب لهدفك</strong>
									<p>خطة تقدر تنفذها حسب مستواك ووقتك.</p>
								</div>
							</div>
							<div className="about-point">
								<span className="point-icon">
									<Utensils size={16} />
								</span>
								<div>
									<strong>تغذية عملية</strong>
									<p>نظام واضح ومناسب لهدفك ونمط حياتك.</p>
								</div>
							</div>
							<div className="about-point">
								<span className="point-icon">
									<Sparkles size={16} />
								</span>
								<div>
									<strong>تعديل مع التقدم</strong>
									<p>متابعة مستمرة وتوجيه عندما تحتاجه.</p>
								</div>
							</div>
						</div>
					</div>
				</section>

				<section className="section plans" id="plans">
					<div className="container-shell">
						<div className="section-intro">
							<div>
								<div className="eyebrow">الاشتراك</div>
								<h2 className="section-heading">
									اختار الباقة
									<br />
									<span>المناسبة ليك</span>
								</h2>
							</div>
							<div>
								<div className="section-rule" />
								<p className="section-copy">
									ابدأ باللي يناسب هدفك حاليا، ومع الوقت نراجع خطتك ونعدلها حسب
									تقدمك.
								</p>
							</div>
						</div>
						<div className="plans-grid">
							<article
								className="plan-card featured"
								data-testid="card-plan-training"
							>
								<span className="plan-badge">الباقة المميزة</span>
								<div className="plan-number">01 / FULL COACHING</div>
								<h3>تدريب + تغذية</h3>
								<p className="plan-sub">حل متكامل لهدفك</p>
								<div className="price-wrap">
									<div className="price">
										799 <small>جنيه / شهريا</small>
									</div>
									<span className="old-price">بدل 1000 جنيه</span>
								</div>
								<ul className="plan-list">
									{[
										"خطة تدريب مناسبة لهدفك",
										"نظام تغذية مناسب لهدفك",
										"متابعة مستمرة",
										"تعديل الخطة حسب تطورك",
										"متابعة التقدم",
										"دعم وتوجيه خلال فترة الاشتراك",
									].map((item, index) => (
										<li
											key={item}
											data-testid={`text-training-feature-${index}`}
										>
											<Check size={16} />
											{item}
										</li>
									))}
								</ul>
								<a
									className="button-primary"
									href={whatsapp(messages.training)}
									target="_blank"
									rel="noreferrer"
									data-testid="link-training-subscribe"
								>
									اشترك دلوقتي <ArrowLeft size={17} />
								</a>
							</article>
							<article className="plan-card" data-testid="card-plan-nutrition">
								<div className="plan-number">02 / NUTRITION</div>
								<h3>تغذية فقط</h3>
								<p className="plan-sub">نظام واضح تقدر تلتزم به</p>
								<div className="price-wrap">
									<div className="price">
										599 <small>جنيه / شهريا</small>
									</div>
									<span className="old-price">بدل 800 جنيه</span>
								</div>
								<ul className="plan-list">
									{[
										"خطة تغذية مناسبة لهدفك",
										"متابعة",
										"تعديل النظام حسب التقدم",
										"توجيه مستمر",
									].map((item, index) => (
										<li
											key={item}
											data-testid={`text-nutrition-feature-${index}`}
										>
											<Check size={16} />
											{item}
										</li>
									))}
								</ul>
								<a
									className="button-outline"
									href={whatsapp(messages.nutrition)}
									target="_blank"
									rel="noreferrer"
									data-testid="link-nutrition-subscribe"
								>
									اشترك دلوقتي <ArrowLeft size={17} />
								</a>
							</article>
						</div>
					</div>
				</section>

				<section className="section steps" id="how">
					<div className="container-shell">
						<div className="section-intro">
							<div>
								<div className="eyebrow">خطوتك الأولى</div>
								<h2 className="section-heading">
									هتبدأ <span>ازاي؟</span>
								</h2>
							</div>
							<div className="section-rule" />
						</div>
						<div className="step-grid">
							{[
								[
									"01",
									"اختار الباقة المناسبة",
									"حدد الخدمة الأقرب لهدفك الحالي.",
								],
								[
									"02",
									"تواصل معايا على WhatsApp",
									"ابعت رسالة الاشتراك وهنبدأ من هناك.",
								],
								[
									"03",
									"نحدد هدفك وبياناتك",
									"نتعرف على هدفك وكل المعلومات المهمة.",
								],
								[
									"04",
									"تبدأ خطتك والمتابعة",
									"توصلك خطتك ونفضل متابعين تقدمك.",
								],
							].map(([number, title, copy]) => (
								<div
									className="step"
									key={number}
									data-testid={`card-step-${number}`}
								>
									<div className="step-num">{number}</div>
									<h3>{title}</h3>
									<p>{copy}</p>
								</div>
							))}
						</div>
					</div>
				</section>

				<section className="section gallery-section" id="results">
					<div className="container-shell">
						<div className="section-intro">
							<div>
								<div className="eyebrow">بدون مبالغة</div>
								<h2 className="section-heading">
									نتائج حقيقية
									<br />
									<span>من عملائنا</span>
								</h2>
							</div>
							<p className="section-copy">
								صور العملاء كما وصلت لنا، بالترتيب. اضغط على أي صورة لمشاهدتها
								بالحجم الكامل.
							</p>
						</div>
						<div className="gallery-grid">
							{transformations.map((src, index) => (
								<button
									className="gallery-item"
									key={src}
									onClick={() =>
										setLightbox({ src, label: `TRANSFORMATION ${index + 1}` })
									}
									aria-label={`فتح صورة التحول ${index + 1}`}
									data-testid={`button-transformation-${index + 1}`}
								>
									<img
										src={src}
										alt={`نتيجة تحول جسم عميل SHABAAN بعد التدريب اونلاين والتغذية - صورة رقم ${index + 1}`}
										loading="lazy"
									/>
									<span className="gallery-index">
										{String(index + 1).padStart(2, "0")}
									</span>
									<Maximize2 size={15} className="gallery-caption" />
								</button>
							))}
						</div>
					</div>
				</section>

				<section className="section audio-section" id="voices">
					<div className="container-shell">
						<div className="section-intro">
							<div>
								<div className="eyebrow">صوت التجربة</div>
								<h2 className="section-heading">
									اسمع تجربة
									<br />
									<span>عملائنا</span>
								</h2>
							</div>
							<p className="section-copy">
								تسجيلات صوتية من العملاء، مرتبة كما تم إرسالها. اضغط تشغيل
								للاستماع.
							</p>
						</div>
						<div className="audio-grid">
							{audioFiles.map((src, index) => (
								<AudioTestimonial key={src} src={src} index={index} />
							))}
						</div>
					</div>
				</section>

				<section className="section faq-section" id="faq">
					<div className="container-shell faq-layout">
						<div className="faq-sticky">
							<div className="eyebrow">أسئلة مهمة</div>
							<div className="faq-mark">؟</div>
							<h2 className="section-heading">
								عندك
								<br />
								<span>سؤال؟</span>
							</h2>
							<p className="section-copy">
								لو في حاجة مش واضحة، ابعتلي على WhatsApp وهنرد عليك.
							</p>
						</div>
						<div className="faq-list">
							{[
								[
									"هل التدريب اونلاين مناسب للمبتدئين؟",
									"أيوه، الخطة بتتحدد حسب مستواك الحالي وهدفك.",
								],
								[
									"هل النظام الغذائي بيتحدد حسب هدفي؟",
									"أيوه، نظام التغذية بيتعمل بما يناسب هدفك والباقة اللي اخترتها.",
								],
								[
									"هل بيتم تعديل الخطة؟",
									"أيوه، بيتم تعديل الخطة حسب تقدمك واحتياجك.",
								],
								[
									"ازاي اشترك؟",
									"اختار الباقة المناسبة واضغط اشترك دلوقتي، هتفتح لك رسالة WhatsApp جاهزة.",
								],
								[
									"ازاي اتواصل معاك؟",
									"من خلال WhatsApp على الرقم +201000257565.",
								],
							].map(([question, answer], index) => (
								<div className="faq-item" key={question}>
									<button
										className="faq-question"
										onClick={() => setOpenFaq(openFaq === index ? null : index)}
										aria-expanded={openFaq === index}
										data-testid={`button-faq-${index + 1}`}
									>
										<span>{question}</span>
										{openFaq === index ? (
											<Minus size={19} />
										) : (
											<Plus size={19} />
										)}
									</button>
									<div
										className={`faq-answer ${openFaq === index ? "open" : ""}`}
										aria-hidden={openFaq !== index}
									>
										{answer}
									</div>
								</div>
							))}
						</div>
					</div>
				</section>

				<section className="conversion" id="contact">
					<div className="container-shell conversion-inner">
						<div>
							<div className="eyebrow">القرار عندك</div>
							<h2>جاهز تبدأ؟</h2>
							<p>اختار الباقة المناسبة ليك وابدأ دلوقتي.</p>
						</div>
						<div className="conversion-actions">
							<a
								className="button-primary"
								href={whatsapp(messages.training)}
								target="_blank"
								rel="noreferrer"
								data-testid="link-cta-training"
							>
								اشترك في التدريب والتغذية <ArrowLeft size={17} />
							</a>
							<a
								className="button-outline"
								href={whatsapp(messages.nutrition)}
								target="_blank"
								rel="noreferrer"
								data-testid="link-cta-nutrition"
							>
								اشترك في التغذية فقط <ArrowLeft size={17} />
							</a>
						</div>
					</div>
				</section>
			</main>

			<footer className="site-footer">
				<div className="container-shell">
					<div className="footer-top">
						<div className="footer-brand">
							<img
								className="footer-logo"
								src="/assets/shabaan-logo.webp"
								alt="شعار شعبان SHABAAN"
								data-testid="img-footer-logo"
							/>
							<p>
								SHABAAN - Online Training &amp; Nutrition
								<br />
								خطة واضحة، متابعة مستمرة، وتقدم تقدر تلاحظه.
							</p>
						</div>
						<div className="footer-social">
							<span>تابعني على السوشيال</span>
							<div className="social-links">
								<a
									className="social-link"
									href="https://www.facebook.com/mahmoud.shabaan.1/"
									target="_blank"
									rel="noreferrer"
									aria-label="تابعني على Facebook"
									data-testid="link-facebook"
								>
									<FaFacebookF size={16} />
									<span>Facebook</span>
								</a>
								<a
									className="social-link"
									href="https://www.instagram.com/mahmoud.shabaan.1/"
									target="_blank"
									rel="noreferrer"
									aria-label="تابعني على Instagram"
									data-testid="link-instagram"
								>
									<FaInstagram size={17} />
									<span>Instagram</span>
								</a>
								<a
									className="social-link"
									href="https://www.tiktok.com/@mahmoud.shabaan.1"
									target="_blank"
									rel="noreferrer"
									aria-label="تابعني على TikTok"
									data-testid="link-tiktok"
								>
									<FaTiktok size={15} />
									<span>TikTok</span>
								</a>
							</div>
						</div>
						<div className="footer-contact">
							<span>للاستفسار والاشتراك</span>
							<a
								href={whatsapp(messages.general)}
								target="_blank"
								rel="noreferrer"
								data-testid="link-footer-whatsapp"
							>
								+20 100 025 7565
							</a>
						</div>
					</div>
					<div className="footer-bottom">
						<span>جميع الحقوق محفوظة لـ SHABAAN</span>
						<span className="footer-en">SHABAAN / ONLINE COACHING</span>
					</div>
				</div>
			</footer>

			<a
				className="floating-whatsapp"
				href={whatsapp(messages.general)}
				target="_blank"
				rel="noreferrer"
				aria-label="تواصل معنا على WhatsApp"
				data-testid="link-floating-whatsapp"
			>
				<MessageCircle size={25} />
			</a>
			{lightbox && (
				<div
					className="lightbox"
					role="dialog"
					aria-modal="true"
					aria-label="عرض الصورة"
					onClick={() => setLightbox(null)}
				>
					<button
						className="lightbox-close"
						onClick={() => setLightbox(null)}
						aria-label="اغلاق الصورة"
						data-testid="button-close-lightbox"
					>
						<X size={22} />
					</button>
					<img
						className="lightbox-image"
						src={lightbox.src}
						alt={lightbox.label}
						onClick={(event) => event.stopPropagation()}
					/>
					<div className="lightbox-label">{lightbox.label}</div>
				</div>
			)}
		</div>
	);
}

function AudioTestimonial({ src, index }: { src: string; index: number }) {
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const [playing, setPlaying] = useState(false);
	const [duration, setDuration] = useState(0);
	const [current, setCurrent] = useState(0);

	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) return;
		const onLoaded = () =>
			setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
		const onTime = () => setCurrent(audio.currentTime);
		const onEnded = () => {
			setPlaying(false);
			setCurrent(0);
		};
		audio.addEventListener("loadedmetadata", onLoaded);
		audio.addEventListener("timeupdate", onTime);
		audio.addEventListener("ended", onEnded);
		return () => {
			audio.removeEventListener("loadedmetadata", onLoaded);
			audio.removeEventListener("timeupdate", onTime);
			audio.removeEventListener("ended", onEnded);
		};
	}, []);

	const toggleAudio = () => {
		const audio = audioRef.current;
		if (!audio) return;
		if (playing) audio.pause();
		else void audio.play();
		setPlaying(!playing);
	};
	const formatTime = (value: number) =>
		`${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, "0")}`;

	return (
		<article className="audio-card" data-testid={`card-audio-${index + 1}`}>
			<audio ref={audioRef} src={src} preload="metadata" />
			<div className="audio-top">
				<span className="audio-label">تجربة عميل</span>
				<span className="audio-index">
					VOICE / {String(index + 1).padStart(2, "0")}
				</span>
			</div>
			<div className="audio-controls">
				<button
					className="play-btn"
					onClick={toggleAudio}
					aria-label={
						playing
							? `ايقاف التجربة ${index + 1}`
							: `تشغيل التجربة ${index + 1}`
					}
					data-testid={`button-audio-${index + 1}`}
				>
					{playing ? (
						<Pause size={18} />
					) : (
						<Play size={18} fill="currentColor" />
					)}
				</button>
				<div className="progress-shell">
					<input
						type="range"
						min="0"
						max={duration || 0}
						step="0.1"
						value={Math.min(current, duration || 0)}
						onChange={(event) => {
							const value = Number(event.target.value);
							if (audioRef.current) audioRef.current.currentTime = value;
							setCurrent(value);
						}}
						aria-label={`تقدم التسجيل ${index + 1}`}
						data-testid={`input-audio-progress-${index + 1}`}
					/>
					<div className="duration">
						<span>{formatTime(current)}</span>
						<span>{formatTime(duration)}</span>
					</div>
				</div>
			</div>
		</article>
	);
}
