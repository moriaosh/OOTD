 import { useState } from 'react';
  import { Calendar as CalendarIcon } from 'lucide-react';
  import Layout from '../components/Layout';

  const CalendarOutfits = () => {
    const [events] = useState([
      { id: 1, title: 'פגישה עסקית', date: '2026-01-15', type: 'עבודה' },
      { id: 2, title: 'אירוע חברתי', date: '2026-01-16', type: 'מסיבה' },
    ]);

    return (
      <Layout>
        <div className="container mx-auto p-8" dir="rtl">
          <h1 className="text-3xl font-bold mb-6">אירועים קרובים</h1>
          <div className="space-y-4">
            {events.map(event => (
              <div key={event.id} className="p-4 bg-white rounded-lg shadow flex justify-between items-center">
                <div>
                  <h3 className="font-bold">{event.title}</h3>
                  <p className="text-sm text-gray-600">{event.date}</p>
                </div>
                <button className="px-4 py-2 bg-indigo-500 text-white rounded-lg">
                  התאם לוק
                </button>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    );
  };

  export default CalendarOutfits;