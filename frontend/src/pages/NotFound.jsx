import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineHome, HiOutlineArrowLeft } from 'react-icons/hi';
import { Button } from '../components/ui';

const NotFound = () => {
  return (
    <div className="min-h-screen pt-24 flex items-center justify-center">
      <div className="max-w-lg mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Large 404 */}
          <div className="relative mb-8">
            <h1 className="font-heading text-[10rem] md:text-[12rem] font-bold text-primary/10 leading-none select-none">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-heading text-6xl md:text-7xl font-semibold text-primary">
                Oops!
              </span>
            </div>
          </div>

          <h2 className="font-heading text-2xl md:text-3xl font-semibold text-text mb-4">
            Page Not Found
          </h2>
          <p className="text-text-muted mb-8 leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
            Let&apos;s get you back to discovering handcrafted treasures.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/">
              <Button size="lg" icon={HiOutlineHome}>
                Back to Home
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              icon={HiOutlineArrowLeft}
              onClick={() => window.history.back()}
            >
              Go Back
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
