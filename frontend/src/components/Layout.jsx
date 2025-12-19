import Header from './Header';
import Navbar from './Navbar';

const Layout = ({ children, showWardrobe = false }) => {
  return (
    <div className="min-h-screen">
      <Header />
      <Navbar />
      <main>
        {children}
      </main>
    </div>
  );
};

export default Layout;

