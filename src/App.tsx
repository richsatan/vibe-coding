import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Edit2, RefreshCw, Check, Users, Sparkles } from 'lucide-react';
import html2canvas from 'html2canvas';

const DEFAULT_STAFF = ['店长', '员工A', '员工B', '员工C', '员工D', '员工E'];

const DEFAULT_AREAS = [
  { id: 'area-1', name: '洗护3座区', duties: '清理3个洗头床、水池、整理毛巾' },
  { id: 'area-2', name: '洗护2座区', duties: '清理2个洗头床、水池、整理毛巾' },
  { id: 'area-3', name: '护理区', duties: '整理仪器、擦拭台面、清理垃圾' },
  { id: 'area-4', name: '前台+杂物间', duties: '整理桌面、清点物品、打扫杂物间' },
  { id: 'area-5', name: '窗台+产品柜', duties: '擦拭玻璃、整理产品摆放、除尘' },
  { id: 'area-6', name: '全场扫地+倒垃圾', duties: '全场扫地、清理所有垃圾桶（注：需清理座椅和躺椅下面的毛发）' },
  { id: 'area-7', name: '全场拖地', duties: '全场拖地，保持地面整洁无水渍' },
];

export default function App() {
  const [staff, setStaff] = useState<string[]>([]);
  const [areas, setAreas] = useState<typeof DEFAULT_AREAS>([]);
  const [assignments, setAssignments] = useState<{ staff: string; area: typeof DEFAULT_AREAS[0] }[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEditingStaff, setIsEditingStaff] = useState(false);
  const [isEditingAreas, setIsEditingAreas] = useState(false);
  const [tempStaff, setTempStaff] = useState<string[]>([]);
  const [tempAreas, setTempAreas] = useState<typeof DEFAULT_AREAS>([]);
  
  const resultRef = useRef<HTMLDivElement>(null);

  // Load from LocalStorage on mount
  useEffect(() => {
    const savedStaff = localStorage.getItem('salon_staff_v3');
    const savedAreas = localStorage.getItem('salon_areas_v3');
    const savedAssignments = localStorage.getItem('salon_assignments_v3');
    
    if (savedStaff) {
      setStaff(JSON.parse(savedStaff));
    } else {
      setStaff(DEFAULT_STAFF);
    }

    if (savedAreas) {
      setAreas(JSON.parse(savedAreas));
    } else {
      setAreas(DEFAULT_AREAS);
    }

    if (savedAssignments) {
      setAssignments(JSON.parse(savedAssignments));
    }
  }, []);

  // Save to LocalStorage when changed
  useEffect(() => {
    if (staff.length > 0) {
      localStorage.setItem('salon_staff_v3', JSON.stringify(staff));
    }
  }, [staff]);

  useEffect(() => {
    if (areas.length > 0) {
      localStorage.setItem('salon_areas_v3', JSON.stringify(areas));
    }
  }, [areas]);

  useEffect(() => {
    if (assignments.length > 0) {
      localStorage.setItem('salon_assignments_v3', JSON.stringify(assignments));
    }
  }, [assignments]);

  const handleEditStaff = () => {
    setTempStaff([...staff]);
    setIsEditingStaff(true);
    setIsEditingAreas(false);
  };

  const handleSaveStaff = () => {
    const newStaff = tempStaff.filter(s => s.trim() !== '');
    if (newStaff.length === 0) {
      alert(`请至少填写1名员工姓名！`);
      return;
    }
    setStaff(newStaff);
    setIsEditingStaff(false);
  };

  const handleStaffChange = (index: number, value: string) => {
    const newStaff = [...tempStaff];
    newStaff[index] = value;
    setTempStaff(newStaff);
  };

  const handleEditAreas = () => {
    setTempAreas([...areas]);
    setIsEditingAreas(true);
    setIsEditingStaff(false);
  };

  const handleSaveAreas = () => {
    const newAreas = tempAreas.filter(a => a.name.trim() !== '' && a.duties.trim() !== '');
    if (newAreas.length === 0) {
      alert(`请至少填写1个区域！`);
      return;
    }
    setAreas(newAreas);
    setIsEditingAreas(false);
  };

  const handleAreaChange = (index: number, field: 'name' | 'duties', value: string) => {
    const newAreas = [...tempAreas];
    newAreas[index] = { ...newAreas[index], [field]: value };
    setTempAreas(newAreas);
  };

  const startDraw = () => {
    if (staff.length === 0 || areas.length === 0) {
      alert(`请先设置员工和区域！`);
      return;
    }

    setIsDrawing(true);
    
    let iterations = 0;
    const maxIterations = 20;
    const intervalTime = 100;

    const interval = setInterval(() => {
      // Shuffle staff
      const shuffledStaff = [...staff].sort(() => Math.random() - 0.5);
      const tempAssignments = areas.map((area, index) => ({
        staff: shuffledStaff[index % shuffledStaff.length],
        area: area,
      }));
      setAssignments(tempAssignments);

      iterations++;
      if (iterations >= maxIterations) {
        clearInterval(interval);
        setIsDrawing(false);
      }
    }, intervalTime);
  };

  const generatePoster = async () => {
    if (!resultRef.current) return;
    
    try {
      const canvas = await html2canvas(resultRef.current, {
        backgroundColor: '#18181b', // zinc-900
        scale: 2, // Higher resolution
      });
      
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `卫生值日表-${new Date().toLocaleDateString()}.png`;
      link.click();
    } catch (error) {
      console.error('Failed to generate poster:', error);
      alert('生成海报失败，请重试。');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-amber-500/30">
      <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* Header */}
        <header className="text-center mb-10 mt-8">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center p-3 bg-zinc-900 rounded-2xl mb-6 shadow-xl border border-zinc-800"
          >
            <Sparkles className="w-8 h-8 text-amber-500" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3"
          >
            沙龙卫生值日排班
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-zinc-400 text-sm sm:text-base"
          >
            公平、随机、高效的每周值日分配系统
          </motion.p>
        </header>

        {/* Main Action Area */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <button
            id="btn-start-draw"
            onClick={startDraw}
            disabled={isDrawing || isEditingStaff || isEditingAreas}
            className="relative overflow-hidden group bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-lg sm:text-xl py-4 px-8 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_40px_-10px_rgba(245,158,11,0.5)] hover:shadow-[0_0_60px_-15px_rgba(245,158,11,0.6)] flex-1 sm:flex-none flex items-center justify-center"
          >
            <span className="relative z-10 flex items-center gap-2">
              <RefreshCw className={`w-6 h-6 ${isDrawing ? 'animate-spin' : ''}`} />
              {isDrawing ? '正在抽签...' : '开始抽签'}
            </span>
            <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
          </button>

          <button
            id="btn-edit-staff"
            onClick={isEditingStaff ? handleSaveStaff : handleEditStaff}
            disabled={isDrawing || isEditingAreas}
            className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 font-medium text-lg py-4 px-8 rounded-2xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 flex-1 sm:flex-none"
          >
            {isEditingStaff ? (
              <>
                <Check className="w-5 h-5 text-emerald-500" />
                保存名单
              </>
            ) : (
              <>
                <Users className="w-5 h-5" />
                修改名单
              </>
            )}
          </button>

          <button
            id="btn-edit-areas"
            onClick={isEditingAreas ? handleSaveAreas : handleEditAreas}
            disabled={isDrawing || isEditingStaff}
            className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 font-medium text-lg py-4 px-8 rounded-2xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 flex-1 sm:flex-none"
          >
            {isEditingAreas ? (
              <>
                <Check className="w-5 h-5 text-emerald-500" />
                保存区域
              </>
            ) : (
              <>
                <Edit2 className="w-5 h-5" />
                修改区域
              </>
            )}
          </button>
        </div>

        {/* Staff Editing Section */}
        <AnimatePresence>
          {isEditingStaff && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-8"
            >
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl">
                <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                  <Edit2 className="w-5 h-5 text-amber-500" />
                  编辑参与人员 (留空以删除)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {tempStaff.map((name, index) => (
                    <div key={`staff-edit-${index}`} className="relative">
                      <input
                        id={`input-staff-${index}`}
                        type="text"
                        value={name}
                        onChange={(e) => handleStaffChange(index, e.target.value)}
                        placeholder={`成员 ${index + 1}`}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder:text-zinc-600"
                      />
                    </div>
                  ))}
                  <div className="relative">
                    <input
                      type="text"
                      value=""
                      onChange={(e) => setTempStaff([...tempStaff, e.target.value])}
                      placeholder={`新增成员...`}
                      className="w-full bg-zinc-950 border border-zinc-800 border-dashed rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder:text-zinc-600"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {isEditingAreas && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-8"
            >
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl">
                <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                  <Edit2 className="w-5 h-5 text-amber-500" />
                  自定义区域和职责 (名称留空以删除)
                </h3>
                <div className="grid gap-4">
                  {tempAreas.map((area, index) => (
                    <div key={`area-edit-${index}`} className="flex flex-col sm:flex-row gap-3 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                      <div className="sm:w-1/3">
                        <label className="block text-xs text-zinc-500 mb-1 uppercase tracking-wider">区域名称</label>
                        <input
                          id={`input-area-name-${index}`}
                          type="text"
                          value={area.name}
                          onChange={(e) => handleAreaChange(index, 'name', e.target.value)}
                          placeholder="例如：洗护3座区"
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs text-zinc-500 mb-1 uppercase tracking-wider">核心职责</label>
                        <input
                          id={`input-area-duties-${index}`}
                          type="text"
                          value={area.duties}
                          onChange={(e) => handleAreaChange(index, 'duties', e.target.value)}
                          placeholder="例如：清理3个洗头床、水池、整理毛巾"
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm"
                        />
                      </div>
                    </div>
                  ))}
                  <div className="flex flex-col sm:flex-row gap-3 bg-zinc-950 p-4 rounded-xl border border-zinc-800 border-dashed opacity-70 hover:opacity-100 transition-opacity">
                    <div className="sm:w-1/3">
                      <label className="block text-xs text-zinc-500 mb-1 uppercase tracking-wider">新增区域</label>
                      <input
                        type="text"
                        value=""
                        onChange={(e) => setTempAreas([...tempAreas, { id: `area-${Date.now()}`, name: e.target.value, duties: '' }])}
                        placeholder="输入新区域名称..."
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-zinc-500 mb-1 uppercase tracking-wider">核心职责</label>
                      <input
                        type="text"
                        value=""
                        disabled
                        placeholder="先输入区域名称..."
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-500 cursor-not-allowed transition-all text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Section */}
        {assignments.length > 0 && !isEditingStaff && !isEditingAreas && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div 
              ref={resultRef}
              id="result-container"
              className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl relative"
            >
              {/* Decorative top border */}
              <div className="h-1 w-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600" />
              
              <div className="p-6 sm:p-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-white tracking-wide">本周卫生值日表</h2>
                  <p className="text-zinc-500 text-sm mt-2">{new Date().toLocaleDateString()}</p>
                </div>

                <div className="grid gap-3 sm:gap-4">
                  {assignments.map((assignment, index) => (
                    <motion.div
                      key={`assignment-${index}`}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ 
                        duration: 0.3,
                        delay: isDrawing ? 0 : index * 0.05 
                      }}
                      className={`flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 p-4 rounded-2xl border ${
                        isDrawing 
                          ? 'bg-zinc-800/50 border-zinc-700/50 animate-pulse' 
                          : 'bg-zinc-950/50 border-zinc-800/80 hover:border-zinc-700 transition-colors'
                      }`}
                    >
                      <div className="flex items-center gap-4 sm:w-1/3">
                        <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shrink-0">
                          <span className="text-amber-500 font-bold text-lg">
                            {assignment.staff.charAt(0)}
                          </span>
                        </div>
                        <span className="text-lg font-medium text-zinc-100">
                          {assignment.staff}
                        </span>
                      </div>
                      
                      <div className="flex-1 pl-14 sm:pl-0">
                        <div className="text-amber-400 font-medium mb-1">
                          {assignment.area.name}
                        </div>
                        <div className="text-zinc-400 text-sm leading-relaxed">
                          {assignment.area.duties}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
              
              {/* Watermark for poster */}
              <div className="absolute bottom-4 right-6 opacity-20 text-xs font-mono tracking-widest pointer-events-none">
                SALON DUTY SYSTEM
              </div>
            </div>

            <div className="flex justify-center">
              <button
                id="btn-generate-poster"
                onClick={generatePoster}
                disabled={isDrawing}
                className="flex items-center gap-2 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 px-6 py-3 rounded-xl transition-colors border border-zinc-800 text-sm font-medium disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                保存海报到本地
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
