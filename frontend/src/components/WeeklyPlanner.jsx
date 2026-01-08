import React, { useState, useEffect } from 'react';

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const HEBREW_DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

const WeeklyPlanner = () => {
    const [plan, setPlan] = useState({});
    const [outfits, setOutfits] = useState([]); // כאן יאוחסנו כל האאוטפיטים מה-DB
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDay, setSelectedDay] = useState(null);

    // שליפת האאוטפיטים הקיימים בארון
    useEffect(() => {
        fetch('/api/outfits') // שנה את הנתיב לפי ה-API שלך
            .then(res => res.json())
            .then(data => setOutfits(data));
    }, []);

    const handleSelectOutfit = (outfitId) => {
        setPlan({ ...plan, [selectedDay]: outfitId });
        setIsModalOpen(false);
    };

    const removeOutfit = (day) => {
        const newPlan = { ...plan };
        delete newPlan[day];
        setPlan(newPlan);
    };

    return (
        <div className="p-4" dir="rtl">
            <h2 className="text-2xl font-bold mb-4">תכנון שבועי</h2>
            <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
                {DAYS.map((day, index) => (
                    <div key={day} className="border p-2 rounded bg-white shadow-sm flex flex-col items-center">
                        <span className="font-semibold">{HEBREW_DAYS[index]}</span>
                        <div className="w-full h-32 border-2 border-dashed mt-2 flex items-center justify-center overflow-hidden">
                            {plan[day] ? (
                                <div className="relative w-full h-full">
                                    <img src={outfits.find(o => o.id === plan[day])?.imageUrl} className="object-cover w-full h-full" />
                                    <button onClick={() => removeOutfit(day)} className="absolute top-0 right-0 bg-red-500 text-white p-1 text-xs">X</button>
                                </div>
                            ) : (
                                <button onClick={() => { setSelectedDay(day); setIsModalOpen(true); }} className="text-3xl text-gray-400">+</button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* מודאל פשוט לבחירת אאוטפיט */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white p-6 rounded-lg max-w-lg w-full max-h-[80vh] overflow-y-auto">
                        <h3 className="text-xl mb-4 text-right">בחר אאוטפיט ליום {HEBREW_DAYS[DAYS.indexOf(selectedDay)]}</h3>
                        <div className="grid grid-cols-3 gap-2">
                            {outfits.map(o => (
                                <img 
                                    key={o.id} 
                                    src={o.imageUrl} 
                                    className="cursor-pointer hover:border-blue-500 border-2" 
                                    onClick={() => handleSelectOutfit(o.id)}
                                />
                            ))}
                        </div>
                        <button onClick={() => setIsModalOpen(false)} className="mt-4 w-full bg-gray-200 py-2">סגור</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WeeklyPlanner;