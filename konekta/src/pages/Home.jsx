import { Link } from 'react-router-dom';

const features = [
  {
    title: 'Stories',
    description: 'Instantly share neon-laced stories and keep your circle in the loop.',
    glow: 'shadow-[0_0_20px_#A200FF55]',
    icon: 'fa-solid fa-circle-play',
  },
  {
    title: 'Swipe Cards',
    description: 'Discover new matches with Tinder-style cards built for campus vibes.',
    glow: 'shadow-[0_0_20px_#FF007A55]',
    icon: 'fa-solid fa-heart',
  },
  {
    title: 'Chats',
    description: 'Slide into colorful, real-time chats and keep every convo flowing.',
    glow: 'shadow-[0_0_20px_#00F5FF55]',
    icon: 'fa-regular fa-comments',
  },
];

const Home = () => {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col animate-fade-in">
      <main className="flex flex-col md:flex-row items-center justify-center gap-16 px-6 lg:px-12 py-16 lg:py-24 w-full max-w-6xl mx-auto">
        <div className="text-center md:text-left space-y-6 max-w-xl animate-slide-up">
          <p className="uppercase tracking-[0.4em] text-xs text-gray-400 animate-fade-in">Konekta</p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-poppins font-bold text-gradient animate-scale-in">
            Swipe. Share. Spark.
          </h1>
          <p className="text-lg text-gray-300 leading-relaxed animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Connect, explore, and share your college experience on Konekta. Find matches, swap stories,
            and spark meaningful friendships in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <Link
              to="/login"
              className="btn-neon text-center py-3 px-8"
            >
              Log-In to Continue
            </Link>
            <Link
              to="/signup"
              className="btn-outline text-center py-3 px-8"
            >
              Sign Up to Get Started
            </Link>
          </div>
        </div>

        <div className="flex-1 max-w-md animate-scale-in" style={{ animationDelay: '0.3s' }}>
          <img
            src="https://github.com/Dragonsin2006/konekta/blob/main/images/WhatsApp%20Image%202025-08-20%20at%2020.10.48.jpeg.jpg?raw=true"
            alt="Konekta preview"
            className="rounded-[36px] w-full shadow-glow hover:scale-105 transition-transform duration-500"
          />
        </div>
      </main>

      <section className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto px-6 pb-16 animate-fade-in" style={{ animationDelay: '0.5s' }}>
        {features.map((feature, index) => (
          <article
            key={feature.title}
            className={`glass-panel p-6 text-center border border-[#1f1f1f] ${feature.glow} hover:scale-105 transition-all duration-300 cursor-pointer animate-slide-up`}
            style={{ animationDelay: `${0.6 + index * 0.1}s` }}
          >
            <i className={`${feature.icon} text-4xl mb-4 text-gradient`} />
            <h2 className="text-2xl font-poppins font-bold mb-3 text-gradient">
              {feature.title}
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
          </article>
        ))}
      </section>

      <footer className="text-center py-8 text-gray-500 text-sm tracking-wide animate-fade-in" style={{ animationDelay: '0.8s' }}>
        © {new Date().getFullYear()} Konekta. Designed for campus connection.
      </footer>
    </div>
  );
};

export default Home;


