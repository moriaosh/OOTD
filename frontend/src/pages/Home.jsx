import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import WardrobeOverlay from '../components/WardrobeOverlay';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <WardrobeOverlay />
      <Layout>
        {/* Main Content */}
        <main className="home-page">
          <h2 className="home-intro-title">היי לך! ❤️</h2>

          <p className="home-intro-text">
            ברוכה הבאה ל־<strong>OOTD</strong>, המקום שבו הארון שלך מקבל חיים חדשים
            והסטייל שלך הופך להרבה יותר קל, כיפי ומדויק.
          </p>

          <p className="home-intro-text">
            כאן מתחיל המסע שלך לעבר ארון דיגיטלי חכם — כזה שמכיר אותך,
            יודע מה את אוהבת ומציע לוקים שמתאימים לכל רגע ביום:
            מהלימודים, לעבודה, לדייט או לאירוע מיוחד 🪩
          </p>

          <p className="home-intro-text">
            אז יאללה יפה — בואי נצא לדרך ונבנה ביחד את הארון החכם שלך.
            הסטייל שלך הולך להיות בלתי־נוצח. 👠✨
          </p>

          {!isAuthenticated && (
            <div style={{ textAlign: 'center', marginTop: '30px' }}>
              <Link
                to="/register"
                className="login-btn"
                style={{ display: 'inline-block', textDecoration: 'none', width: 'auto', padding: '14px 40px' }}
              >
                התחילי עכשיו
              </Link>
            </div>
          )}
        </main>
      </Layout>
    </>
  );
};

export default Home;

