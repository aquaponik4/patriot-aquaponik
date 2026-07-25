import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { ref, onValue, set } from 'firebase/database';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { db, auth } from './firebase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Droplet, Thermometer, Activity, Wifi, Power, Moon, Sun, Settings, LogOut, Home, Save, Server, Clock, CalendarDays, Sliders } from 'lucide-react';

// --- KOMPONEN NAVIGASI UTAMA ---
const Navbar = ({ user, darkMode, setDarkMode }) => {
  const navigate = useNavigate();
  const handleLogout = () => signOut(auth).then(() => navigate('/login'));

  return (
    <nav className="bg-[#0f2847] text-white p-4 flex flex-wrap justify-between items-center shadow-lg transition-colors duration-300 dark:bg-gray-900">
      <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start mb-4 md:mb-0">
        <div className="flex items-center gap-2">
	  <img src="/icon.png" alt="Logo" className="w-8 h-8 object-contain" />
	  <h1 className="text-2xl font-bold tracking-wide">PATRIOT</h1>
	</div>
        <button onClick={() => setDarkMode(!darkMode)} className="p-2 bg-[#163a66] rounded-full md:hidden dark:bg-gray-800 focus:outline-none">
          {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-blue-200" />}
        </button>
      </div>

      <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end overflow-x-auto">
        <Link to="/" className="flex items-center gap-2 hover:text-blue-300 transition-colors">
          <Home className="w-5 h-5" /> <span className="font-medium">Dashboard</span>
        </Link>
        {user ? (
          <>
            <Link to="/settings" className="flex items-center gap-2 hover:text-blue-300 transition-colors">
              <Settings className="w-5 h-5" /> <span className="font-medium">Settings</span>
            </Link>
            <button onClick={handleLogout} className="flex items-center gap-2 text-red-400 hover:text-red-300">
              <LogOut className="w-5 h-5" /> <span className="font-medium">Logout</span>
            </button>
          </>
        ) : (
          <Link to="/login" className="flex items-center gap-2 text-green-400 hover:text-green-300">
             <span className="font-medium">Admin Login</span>
          </Link>
        )}
        <button onClick={() => setDarkMode(!darkMode)} className="hidden md:flex p-2 bg-[#163a66] rounded-full ml-2 dark:bg-gray-800 focus:outline-none">
          {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-blue-200" />}
        </button>
      </div>
    </nav>
  );
};

// --- HALAMAN LOGIN ADMIN ---
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    signInWithEmailAndPassword(auth, email, password)
      .then(() => navigate('/settings'))
      .catch(() => setError("Login gagal. Periksa kredensial Anda."));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">Otorisasi Admin</h2>
        {error && <p className="text-red-500 mb-4 text-center bg-red-100 p-2 rounded">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" required />
          <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition-colors">
            Masuk Sistem
          </button>
        </form>
      </div>
    </div>
  );
};

// --- HALAMAN PENGATURAN KOMPREHENSIF (SETTINGS) ---
const SettingsPage = ({ user }) => {
  const [sensorSet, setSensorSet] = useState({ ph: true, tds: true, suhuAir: true, suhuUdara: true, kelembaban: true });
  const [mqttSet, setMqttSet] = useState({ broker: '', port: '', topicSub: '', topicPub: '' });
  const [wifiSet, setWifiSet] = useState({ ssid: '', password: '' });
  const [datetimeSet, setDatetimeSet] = useState({ tanggal: '', jam: '' });
  const [scheduleSet, setScheduleSet] = useState({ pakanPagi: '', pakanSore: '', jadwalNutrisi: '', durasiNutrisi: '' });
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    onValue(ref(db, 'aquaponik/settings'), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        if (data.sensor) setSensorSet(data.sensor);
        if (data.telemetry) setMqttSet(data.telemetry);
        if (data.wifi) setWifiSet(data.wifi);
        if (data.datetime) setDatetimeSet(data.datetime);
        if (data.schedule) setScheduleSet(data.schedule);
      }
    });
  }, []);

  const toggleSensor = (key) => {
    const newVal = { ...sensorSet, [key]: !sensorSet[key] };
    setSensorSet(newVal);
    set(ref(db, 'aquaponik/settings/sensor'), newVal); 
  };

  const handleSaveData = (path, data) => {
    set(ref(db, `aquaponik/settings/${path}`), data)
      .then(() => {
        setSaveStatus('Berhasil disimpan!');
        setTimeout(() => setSaveStatus(''), 3000);
      });
  };

  if (!user) return <Navigate to="/login" />;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-gray-600 dark:text-gray-300" /> Konfigurasi Sistem Manual (LCD Sync)
        </h2>
        {saveStatus && <span className="bg-green-500 text-white px-4 py-1.5 rounded-lg font-medium animate-pulse text-sm">{saveStatus}</span>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700">
          <h3 className="font-semibold text-lg mb-4 text-gray-700 dark:text-gray-200 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-indigo-500" /> Setting Waktu & Tanggal (RTC)
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Tanggal</label>
              <input type="date" value={datetimeSet.tanggal} onChange={(e) => setDatetimeSet({...datetimeSet, tanggal: e.target.value})}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Jam</label>
              <input type="time" value={datetimeSet.jam} onChange={(e) => setDatetimeSet({...datetimeSet, jam: e.target.value})}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500" />
            </div>
          </div>
          <button onClick={() => handleSaveData('datetime', datetimeSet)} className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded flex justify-center items-center gap-2 transition-colors">
            <Save className="w-4 h-4" /> Sinkronisasi ke Perangkat
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700">
          <h3 className="font-semibold text-lg mb-4 text-gray-700 dark:text-gray-200 flex items-center gap-2">
            <Wifi className="w-5 h-5 text-blue-500" /> Setting Wi-Fi (ESP32)
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">SSID Jaringan</label>
              <input type="text" placeholder="Nama Wi-Fi" value={wifiSet.ssid} onChange={(e) => setWifiSet({...wifiSet, ssid: e.target.value})}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Password</label>
              <input type="password" placeholder="Password Wi-Fi" value={wifiSet.password} onChange={(e) => setWifiSet({...wifiSet, password: e.target.value})}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <button onClick={() => handleSaveData('wifi', wifiSet)} className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded flex justify-center items-center gap-2 transition-colors">
              <Save className="w-4 h-4" /> Simpan Konfigurasi Wi-Fi
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700">
          <h3 className="font-semibold text-lg mb-4 text-gray-700 dark:text-gray-200 flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-500" /> Setting Jadwal Pakan & Nutrisi
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Jam Pakan Pagi</label>
              <input type="time" value={scheduleSet.pakanPagi} onChange={(e) => setScheduleSet({...scheduleSet, pakanPagi: e.target.value})}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-1 focus:ring-yellow-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Jam Pakan Sore</label>
              <input type="time" value={scheduleSet.pakanSore} onChange={(e) => setScheduleSet({...scheduleSet, pakanSore: e.target.value})}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-1 focus:ring-yellow-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Jadwal Pompa Nutrisi</label>
              <input type="time" value={scheduleSet.jadwalNutrisi} onChange={(e) => setScheduleSet({...scheduleSet, jadwalNutrisi: e.target.value})}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-1 focus:ring-yellow-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Durasi Nutrisi (Menit)</label>
              <input type="number" placeholder="Contoh: 15" value={scheduleSet.durasiNutrisi} onChange={(e) => setScheduleSet({...scheduleSet, durasiNutrisi: e.target.value})}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-1 focus:ring-yellow-500" />
            </div>
          </div>
          <button onClick={() => handleSaveData('schedule', scheduleSet)} className="mt-4 w-full bg-yellow-600 hover:bg-yellow-700 text-white p-2 rounded flex justify-center items-center gap-2 transition-colors">
            <Save className="w-4 h-4" /> Simpan Jadwal
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700">
          <h3 className="font-semibold text-lg mb-4 text-gray-700 dark:text-gray-200 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-green-500" /> Kontrol Fungsi Sensor
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Mengaktifkan/menonaktifkan modul sensor secara spesifik.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 h-48 overflow-y-auto pr-2">
            {Object.keys(sensorSet).map((key) => (
              <div key={key} className="flex justify-between items-center p-2.5 bg-gray-50 dark:bg-gray-700 rounded-lg border dark:border-gray-600">
                <span className="font-medium text-sm text-gray-700 dark:text-gray-200 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                <button onClick={() => toggleSensor(key)}
                  className={`w-11 h-6 rounded-full transition-colors flex items-center focus:outline-none ${sensorSet[key] ? 'bg-green-500' : 'bg-gray-400 dark:bg-gray-500'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${sensorSet[key] ? 'translate-x-6' : 'translate-x-1'}`}></div>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700 lg:col-span-2">
          <h3 className="font-semibold text-lg mb-4 text-gray-700 dark:text-gray-200 flex items-center gap-2">
            <Server className="w-5 h-5 text-purple-500" /> Setting Telemetri & MQTT
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">URL MQTT Broker</label>
              <input type="text" placeholder="misal: broker.hivemq.com" value={mqttSet.broker} onChange={(e) => setMqttSet({...mqttSet, broker: e.target.value})}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-1 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Port Broker</label>
              <input type="text" placeholder="misal: 1883" value={mqttSet.port} onChange={(e) => setMqttSet({...mqttSet, port: e.target.value})}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-1 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Topik Sensor (Subscribe)</label>
              <input type="text" placeholder="patriot/sensor/#" value={mqttSet.topicSub} onChange={(e) => setMqttSet({...mqttSet, topicSub: e.target.value})}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-1 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Topik Kontrol (Publish)</label>
              <input type="text" placeholder="patriot/kontrol" value={mqttSet.topicPub} onChange={(e) => setMqttSet({...mqttSet, topicPub: e.target.value})}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-1 focus:ring-purple-500" />
            </div>
          </div>
          <button onClick={() => handleSaveData('telemetry', mqttSet)} className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded flex justify-center items-center gap-2 transition-colors">
            <Save className="w-4 h-4" /> Terapkan Konfigurasi Telemetri
          </button>
        </div>

      </div>
    </div>
  );
};

// --- HALAMAN DASHBOARD UTAMA ---
const Dashboard = () => {
  const [sensorData, setSensorData] = useState({});
  const [historyData, setHistoryData] = useState([]);
  const [kontrolData, setKontrolData] = useState({});
  const [scheduleData, setScheduleData] = useState({});
  const [sensorSet, setSensorSet] = useState({ ph: true, tds: true, suhuAir: true, suhuUdara: true, kelembaban: true });
  const [statusDB, setStatusDB] = useState('OFFLINE');
  const [activeLogTab, setActiveLogTab] = useState('suhuUdara');
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const lastUpdateRef = useRef(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    const unsubscribeRealtime = onValue(ref(db, 'aquaponik/realtime'), (snapshot) => {
      if (snapshot.val()) { 
        setSensorData(snapshot.val()); 
        lastUpdateRef.current = Date.now(); 
        setStatusDB('ONLINE'); 
      }
    });

    const watchdog = setInterval(() => {
      if (Date.now() - lastUpdateRef.current > 15000) {
        setStatusDB('OFFLINE');
      }
    }, 3000);

    onValue(ref(db, 'aquaponik/history'), (snapshot) => {
      if (snapshot.val()) {
        const formatData = Object.values(snapshot.val()).map(item => ({
          ...item, 
          time: new Date(item.waktu).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'}),
          fullTime: item.waktu || new Date().toLocaleString()
        })).reverse().slice(0, 15);
        setHistoryData(formatData);
      }
    });

    onValue(ref(db, 'aquaponik/kontrol'), (snapshot) => {
      const defaultKontrol = { 
        pompaAir: false, 
        pompaNA: false, 
        pompaNB: false, 
        pompaPHU: false, 
        pompaPHD: false, 
        pakanIkan: false
      };
      if (snapshot.val()) setKontrolData({ ...defaultKontrol, ...snapshot.val() });
      else setKontrolData(defaultKontrol);
    });

    onValue(ref(db, 'aquaponik/settings/schedule'), (snapshot) => {
      if (snapshot.val()) setScheduleData(snapshot.val());
    });

    onValue(ref(db, 'aquaponik/settings/sensor'), (snapshot) => {
      const defaultSensor = { ph: true, tds: true, suhuAir: true, suhuUdara: true, kelembaban: true };
      if (snapshot.val()) setSensorSet({ ...defaultSensor, ...snapshot.val() });
      else setSensorSet(defaultSensor);
    });

    return () => {
      clearInterval(timer);
      clearInterval(watchdog);
    };
  }, []);

  const toggleDevice = (device) => {
    set(ref(db, `aquaponik/kontrol/${device}`), !kontrolData[device]);
  };

  // Desain Kartu Sensor Kotak Sesuai Awal
  const SensorCard = ({ title, value, unit, icon: Icon, color }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700 shadow-sm flex flex-col items-center justify-center relative overflow-hidden transition-colors">
      <div className={`absolute top-0 left-0 w-full h-1 ${color}`}></div>
      <div className="flex items-center gap-2 mb-2 w-full justify-center">
        <Icon className="text-gray-500 dark:text-gray-400 w-5 h-5" />
        <h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm md:text-base">{title}</h3>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">{value}</span>
        <span className="text-gray-500 dark:text-gray-400 font-medium">{unit}</span>
      </div>
    </div>
  );

  const formattedDateString = currentTime.toLocaleDateString('id-ID', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  const formattedTimeString = currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* HEADER BANNER DENGAN TANGGAL & WAKTU */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4 transition-colors">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500 p-2 rounded-xl text-white">
            <Activity className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white italic">Smart Aquaponic Dashboard</h1>
            <p className="text-xs text-gray-400">Aquaponik | Live Monitor & Control</p>
          </div>
        </div>
        <div className="text-right flex flex-col items-end">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Update Terakhir: {formattedDateString} {formattedTimeString}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">Status System:</span>
            <span className={`font-bold px-2 py-0.5 rounded text-xs ${statusDB === 'ONLINE' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{statusDB}</span>
            <span className={`w-2.5 h-2.5 rounded-full ${statusDB === 'ONLINE' ? 'bg-green-500 animate-ping' : 'bg-red-500'}`}></span>
          </div>
        </div>
      </div>

      {/* KARTU NILAI SENSOR KEMBALI KE DESAIN AWAL */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
        {sensorSet.ph && <SensorCard title="pH Air" value={statusDB === 'ONLINE' ? (sensorData.ph || "0.0") : "0.0"} unit="" icon={Activity} color="bg-blue-400" />}
        {sensorSet.tds && <SensorCard title="TDS" value={statusDB === 'ONLINE' ? (sensorData.tds || "0") : "0"} unit="ppm" icon={Droplet} color="bg-blue-500" />}
        {sensorSet.suhuAir && <SensorCard title="Suhu Air" value={statusDB === 'ONLINE' ? (sensorData.suhuAir || "0.0") : "0.0"} unit="°C" icon={Thermometer} color="bg-red-400" />}
        {sensorSet.suhuUdara && <SensorCard title="Suhu Udara" value={statusDB === 'ONLINE' ? (sensorData.suhuUdara || "0.0") : "0.0"} unit="°C" icon={Thermometer} color="bg-red-500" />}
        {sensorSet.kelembaban && <SensorCard title="Kelembaban" value={statusDB === 'ONLINE' ? (sensorData.kelembaban || "0") : "0"} unit="%" icon={Droplet} color="bg-blue-300" />}
      </div>

      {/* GRAFIK & KONTROL MANUAL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* GRAFIK HISTORI KEMBALI KE DESAIN AWAL */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border dark:border-gray-700 lg:col-span-2 transition-colors">
          <h2 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-500" /> GRAFIK HISTORI
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyData.length > 0 ? historyData : [{time: '00:00', ph: 0, tds: 0, suhuAir: 0}]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
                <XAxis dataKey="time" stroke="#9ca3af" />
                <YAxis yAxisId="left" stroke="#9ca3af" />
                <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', color: '#fff', border: 'none' }} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="ph" stroke="#10b981" strokeWidth={2} name="pH Air" />
                <Line yAxisId="right" type="monotone" dataKey="tds" stroke="#3b82f6" strokeWidth={2} name="TDS (ppm)" />
                <Line yAxisId="left" type="monotone" dataKey="suhuAir" stroke="#f97316" strokeWidth={2} name="Suhu Air" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* KONTROL MANUAL */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border dark:border-gray-700 transition-colors">
          <h2 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
            <Power className="w-5 h-5 text-red-500" /> KONTROL MANUAL
          </h2>
          <div className="space-y-3 h-64 overflow-y-auto pr-2">
            {Object.keys(kontrolData)
              .filter((device) => device !== 'pompa')
              .map((device) => {
                const labelMap = {
                  pompaAir: "POMPA AIR", 
                  pompaNA: "POMPA NUTRISI A", 
                  pompaNB: "POMPA NUTRISI B",
                  pompaPHU: "POMPA PH UP", 
                  pompaPHD: "POMPA PH DOWN", 
                  pakanIkan: "PAKAN IKAN (PKN)"
                };
                const label = labelMap[device] || device;

                return (
                  <div key={device} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border dark:border-gray-600 transition-colors">
                    <span className="font-medium text-sm text-gray-700 dark:text-gray-200">{label}</span>
                    <button 
                      onClick={() => toggleDevice(device)}
                      className={`w-12 h-6 rounded-full transition-colors flex items-center shadow-inner focus:outline-none ${kontrolData[device] ? 'bg-green-500' : 'bg-gray-400 dark:bg-gray-600'}`}>
                      <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${kontrolData[device] ? 'translate-x-6' : 'translate-x-1'}`}></div>
                    </button>
                  </div>
                );
            })}
          </div>
        </div>

      </div>

      {/* LOG DATA TIAP SENSOR & TABEL JADWAL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* TABEL LOG DATA PER SENSOR */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border dark:border-gray-700 lg:col-span-2 transition-colors">
          <div className="flex flex-wrap gap-2 mb-4 border-b pb-3 dark:border-gray-700">
            {['suhuUdara', 'kelembaban', 'ph', 'suhuAir', 'tds'].map((tab) => (
              <button key={tab} onClick={() => setActiveLogTab(tab)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors ${activeLogTab === tab ? 'bg-emerald-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'}`}>
                {tab.replace(/([A-Z])/g, ' $1')}
              </button>
            ))}
          </div>
          
          <div className="overflow-x-auto h-48">
            <table className="w-full text-left text-xs text-gray-600 dark:text-gray-300">
              <thead className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 uppercase">
                <tr>
                  <th className="p-2">Time</th>
                  <th className="p-2">Type</th>
                  <th className="p-2 text-right">Val</th>
                </tr>
              </thead>
              <tbody>
                {historyData.length > 0 ? historyData.map((row, idx) => (
                  <tr key={idx} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="p-2">{row.fullTime || row.time}</td>
                    <td className="p-2 font-semibold text-emerald-600">RECV</td>
                    <td className="p-2 text-right font-bold">{row[activeLogTab] || 0}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="3" className="text-center p-6 text-gray-400">Belum ada data log riwayat.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* TABEL JADWAL AKTIF DI DASHBOARD */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border dark:border-gray-700 transition-colors">
          <h2 className="text-base font-bold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-500" /> Jadwal Aktif Sistem
          </h2>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border dark:border-gray-600">
              <span className="font-semibold text-gray-600 dark:text-gray-300">Pakan Pagi:</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">{scheduleData.pakanPagi || "Belum diatur"}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border dark:border-gray-600">
              <span className="font-semibold text-gray-600 dark:text-gray-300">Pakan Sore:</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">{scheduleData.pakanSore || "Belum diatur"}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border dark:border-gray-600">
              <span className="font-semibold text-gray-600 dark:text-gray-300">Jadwal Nutrisi:</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">{scheduleData.jadwalNutrisi || "Belum diatur"}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border dark:border-gray-600">
              <span className="font-semibold text-gray-600 dark:text-gray-300">Durasi Nutrisi:</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">{scheduleData.durasiNutrisi ? `${scheduleData.durasiNutrisi} Menit` : "Belum diatur"}</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

// --- PEMBUNGKUS APLIKASI UTAMA ---
export default function App() {
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, currentUser => setUser(currentUser));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300 font-sans">
        <Navbar user={user} darkMode={darkMode} setDarkMode={setDarkMode} />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={user ? <Navigate to="/settings" /> : <Login />} />
          <Route path="/settings" element={<SettingsPage user={user} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
