import { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Loader2, Sparkles, CheckCircle, Eye, Palette, Sun, Snowflake, Leaf, Flower2, AlertCircle } from 'lucide-react';
import Layout from '../components/Layout';

const ColorAnalysis = () => {
  const [step, setStep] = useState('upload'); // 'upload' | 'analyzing' | 'results'
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [latestAnalysis, setLatestAnalysis] = useState(null);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);

  // Load latest analysis on mount
  useEffect(() => {
    fetchLatestAnalysis();
  }, []);

  // Set video source when camera opens and ref is ready
  useEffect(() => {
    if (isCameraOpen && cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [isCameraOpen, cameraStream]);

  const fetchLatestAnalysis = async () => {
    try {
      const token = localStorage.getItem('ootd_authToken');
      const response = await fetch('http://localhost:5000/api/color-analysis/latest', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLatestAnalysis(data.analysis);
      }
    } catch (err) {
      console.log('No previous analysis found');
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' }
      });
      setCameraStream(stream);
      setIsCameraOpen(true);
      setError(null);
    } catch (err) {
      setError('לא ניתן לגשת למצלמה. אנא בדקי את ההרשאות.');
      console.error('Camera error:', err);
    }
  };

  const capturePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
      setSelectedImage(file);
      setImagePreview(canvas.toDataURL('image/jpeg'));
      closeCamera();
    }, 'image/jpeg');
  };

  const closeCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraOpen(false);
  };

  const analyzeImage = async () => {
    if (!selectedImage) {
      setError('אנא בחרי תמונה תחילה');
      return;
    }

    setAnalyzing(true);
    setError(null);
    setStep('analyzing');

    try {
      const formData = new FormData();
      formData.append('image', selectedImage);

      const token = localStorage.getItem('ootd_authToken');
      const response = await fetch('http://localhost:5000/api/color-analysis/analyze', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'שגיאה בניתוח');
      }

      setAnalysis(data.analysis);
      setStep('results');

    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message || 'שגיאה בניתוח הצבעים');
      setStep('upload');
    } finally {
      setAnalyzing(false);
    }
  };

  const reset = () => {
    setStep('upload');
    setSelectedImage(null);
    setImagePreview(null);
    setAnalysis(null);
    setError(null);
  };

  const getSeasonIcon = (season) => {
    const icons = {
      'Spring': <Flower2 className="w-6 h-6" />,
      'Summer': <Sun className="w-6 h-6" />,
      'Autumn': <Leaf className="w-6 h-6" />,
      'Winter': <Snowflake className="w-6 h-6" />
    };
    return icons[season] || <Sparkles className="w-6 h-6" />;
  };

  const getSeasonGradient = (season) => {
    const gradients = {
      'Spring': 'from-pink-400 via-yellow-300 to-green-300',
      'Summer': 'from-blue-300 via-cyan-300 to-teal-300',
      'Autumn': 'from-orange-400 via-red-400 to-amber-600',
      'Winter': 'from-blue-500 via-purple-500 to-indigo-600'
    };
    return gradients[season] || 'from-purple-400 to-pink-400';
  };

  return (
    <Layout>
      {/* Soft ambient background */}
      <div className="min-h-screen bg-gradient-to-br from-purple-50/30 via-pink-50/20 to-blue-50/30 relative" dir="rtl">
        <div className="absolute top-20 right-10 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-pink-200/20 rounded-full blur-3xl" />

        <div className="relative pt-40 pb-12 px-4 sm:px-8">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12 relative z-20">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400/20 to-pink-400/20 backdrop-blur-xl flex items-center justify-center border border-white/40 shadow-lg">
                  <Palette className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-l from-purple-600 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                    מה הצבעים שלי?
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">גלי אילו צבעים מחמיאים לך ביותר</p>
                </div>
              </div>
            </div>

            {/* Main Content */}
            {step === 'upload' && (
              <UploadStep
                imagePreview={imagePreview}
                selectedImage={selectedImage}
                isCameraOpen={isCameraOpen}
                videoRef={videoRef}
                canvasRef={canvasRef}
                fileInputRef={fileInputRef}
                onFileSelect={handleFileSelect}
                onOpenCamera={openCamera}
                onCapturePhoto={capturePhoto}
                onCloseCamera={closeCamera}
                onAnalyze={analyzeImage}
                error={error}
                latestAnalysis={latestAnalysis}
                onViewLatest={() => {
                  setAnalysis(latestAnalysis);
                  setStep('results');
                }}
              />
            )}

            {step === 'analyzing' && (
              <AnalyzingStep />
            )}

            {step === 'results' && analysis && (
              <ResultsStep
                analysis={analysis}
                onReset={reset}
                getSeasonGradient={getSeasonGradient}
                getSeasonIcon={getSeasonIcon}
              />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

// ==================== UPLOAD STEP ====================
const UploadStep = ({
  imagePreview,
  selectedImage,
  isCameraOpen,
  videoRef,
  canvasRef,
  fileInputRef,
  onFileSelect,
  onOpenCamera,
  onCapturePhoto,
  onCloseCamera,
  onAnalyze,
  error,
  latestAnalysis,
  onViewLatest
}) => {
  return (
    <div className="space-y-6">
      {/* Previous Analysis Callout */}
      {latestAnalysis && !imagePreview && (
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 border border-white/60 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <div>
                <p className="font-semibold text-gray-800">יש לך ניתוח קודם</p>
                <p className="text-sm text-gray-600">
                  עונה: {latestAnalysis.season} • גוון: {latestAnalysis.skinTone}
                </p>
              </div>
            </div>
            <button
              onClick={onViewLatest}
              className="px-4 py-2 bg-purple-500/90 text-white rounded-xl hover:bg-purple-600 transition-colors text-sm font-semibold"
            >
              הצג
            </button>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div className="bg-white/40 backdrop-blur-xl rounded-3xl border border-white/60 shadow-lg overflow-hidden">
        <div className="p-8">
          {!imagePreview && !isCameraOpen ? (
            // Initial Upload UI
            <div className="text-center space-y-6">
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                <Camera className="w-12 h-12 text-purple-600" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">העלי תמונת סלפי</h3>
                <p className="text-gray-600">
                  הבינה המלאכותית תנתח את גוון העור, צבע העיניים והשיער שלך
                </p>
              </div>

              {/* Upload Buttons */}
              <div className="flex gap-4 justify-center flex-wrap">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="group px-6 py-3 bg-gradient-to-r from-purple-500/90 to-pink-500/90 backdrop-blur-xl border border-white/30 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2 text-white font-semibold"
                >
                  <Upload className="w-5 h-5" />
                  העלי תמונה
                </button>

                <button
                  onClick={onOpenCamera}
                  className="px-6 py-3 bg-white/60 backdrop-blur-xl border border-white/80 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2 text-gray-700 font-semibold"
                >
                  <Camera className="w-5 h-5" />
                  פתחי מצלמה
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onFileSelect}
                className="hidden"
              />
            </div>
          ) : isCameraOpen ? (
            // Camera View
            <div className="space-y-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-2xl"
              />
              <canvas ref={canvasRef} className="hidden" />

              <div className="flex gap-4 justify-center">
                <button
                  onClick={onCapturePhoto}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all font-semibold"
                >
                  צלמי תמונה
                </button>
                <button
                  onClick={onCloseCamera}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-2xl shadow-lg hover:shadow-xl transition-all font-semibold"
                >
                  ביטול
                </button>
              </div>
            </div>
          ) : (
            // Image Preview
            <div className="space-y-6">
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full max-h-96 object-contain rounded-2xl"
                />
              </div>

              <div className="flex gap-4 justify-center flex-wrap">
                <button
                  onClick={onAnalyze}
                  className="group px-8 py-4 bg-gradient-to-r from-purple-500/90 to-pink-500/90 backdrop-blur-xl border border-white/30 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2 text-white font-bold text-lg"
                >
                  <Sparkles className="w-6 h-6" />
                  נתחי את הצבעים שלי!
                </button>

                <button
                  onClick={() => {
                    onFileSelect({ target: { files: [] } });
                  }}
                  className="px-6 py-3 bg-white/60 backdrop-blur-xl border border-white/80 rounded-2xl shadow-lg hover:shadow-xl transition-all font-semibold text-gray-700"
                >
                  בחרי תמונה אחרת
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: <Eye className="w-5 h-5" />, title: 'ניתוח מדויק', desc: 'AI מתקדם מנתח את תווי הפנים שלך' },
          { icon: <Palette className="w-5 h-5" />, title: 'המלצות אישיות', desc: 'צבעים שמחמיאים דווקא לך' },
          { icon: <Sparkles className="w-5 h-5" />, title: 'עונת צבעים', desc: 'גלי אם את Spring, Summer, Autumn או Winter' }
        ].map((item, idx) => (
          <div key={idx} className="bg-white/40 backdrop-blur-xl rounded-2xl p-4 border border-white/60 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100/80 flex items-center justify-center text-purple-600">
                {item.icon}
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">{item.title}</p>
                <p className="text-xs text-gray-600">{item.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==================== ANALYZING STEP ====================
const AnalyzingStep = () => {
  return (
    <div className="bg-white/40 backdrop-blur-xl rounded-3xl border border-white/60 shadow-lg p-12">
      <div className="text-center space-y-6">
        <div className="relative w-32 h-32 mx-auto">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse" />
          <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
            <Loader2 className="w-16 h-16 text-purple-500 animate-spin" />
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">מנתחת את הצבעים שלך...</h3>
          <p className="text-gray-600">
            הבינה המלאכותית בודקת את גוון העור, צבע העיניים והשיער 🤖✨
          </p>
        </div>
      </div>
    </div>
  );
};

// ==================== RESULTS STEP ====================
const ResultsStep = ({ analysis, onReset, getSeasonGradient, getSeasonIcon }) => {
  return (
    <div className="space-y-6">
      {/* Season Card */}
      <div className={`bg-gradient-to-r ${getSeasonGradient(analysis.season)} rounded-3xl p-8 text-white shadow-xl`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/30 backdrop-blur-xl rounded-2xl flex items-center justify-center">
              {getSeasonIcon(analysis.season)}
            </div>
            <div>
              <p className="text-white/80 text-sm font-medium">העונה שלך היא</p>
              <h2 className="text-4xl font-bold">{analysis.season}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Details */}
      <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/60 shadow-lg p-8">
        <h3 className="text-xl font-bold text-gray-800 mb-6">פרטי הניתוח</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DetailCard label="גוון עור" value={analysis.skinTone} detail={analysis.skinToneDetails} />
          <DetailCard label="צבע עיניים" value={analysis.eyeColor} />
          <DetailCard label="צבע שיער" value={analysis.hairColor} />
          {analysis.lipColor && <DetailCard label="צבע שפתיים" value={analysis.lipColor} />}
        </div>
      </div>

      {/* Best Colors */}
      <ColorSwatchesCard title="הצבעים שמחמיאים לך ביותר 💖" colors={analysis.bestColors} />

      {/* Avoid Colors */}
      <ColorSwatchesCard title="צבעים שכדאי להימנע מהם" colors={analysis.avoidColors} isAvoid />

      {/* Recommendations */}
      <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/60 shadow-lg p-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-500" />
          המלצות אישיות
        </h3>
        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
          {analysis.recommendations}
        </p>
      </div>

      {/* Action Button */}
      <div className="text-center">
        <button
          onClick={onReset}
          className="px-8 py-4 bg-gradient-to-r from-purple-500/90 to-pink-500/90 backdrop-blur-xl border border-white/30 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 text-white font-bold text-lg"
        >
          נתחי תמונה חדשה
        </button>
      </div>
    </div>
  );
};

// Helper Components
const DetailCard = ({ label, value, detail }) => (
  <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-white/60">
    <p className="text-sm text-gray-600 mb-1">{label}</p>
    <p className="text-lg font-bold text-gray-800 capitalize">{value}</p>
    {detail && <p className="text-xs text-gray-500 mt-1">{detail}</p>}
  </div>
);

const ColorSwatchesCard = ({ title, colors, isAvoid }) => (
  <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/60 shadow-lg p-8">
    <h3 className="text-xl font-bold text-gray-800 mb-6">{title}</h3>
    <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-10 gap-3">
      {colors.map((color, idx) => (
        <div
          key={idx}
          className="group relative aspect-square rounded-xl shadow-lg hover:scale-110 transition-transform cursor-pointer border-2 border-white"
          style={{ backgroundColor: color }}
          title={color}
        >
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 rounded-xl transition-opacity" />
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {color}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default ColorAnalysis;
