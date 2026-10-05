// src/pages/VideoOpsPage.jsx

import { useState, useEffect, useMemo } from 'react';
import { useData, useDataDispatch } from '../context/DataContext';
import { useUi } from '../context/UiContext';
import { Card, Badge, Button, Avatar, EmptyState, Select } from '../components/ui';
import { cn } from '../utils/cn';
import { formatTimeAgo } from '../utils/dates'; // Допустим, есть такая утилита, иначе используем встроенную

// Заглушка для видео (можно заменить на реальный mp4 ссылка)
const DEMO_VIDEO_URL = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

const SEVERITY_COLORS = {
    critical: '#fb7185', // Red
    high: '#f97316',     // Orange
    medium: '#fbbf24',   // Yellow
    low: '#22c55e',      // Green
    info: '#94a3b8',     // Gray
};

const EVENT_LABELS = {
    ppe_missing: 'Нет СИЗ',
    phone_use: 'Телефон в работе',
    cycle_completed: 'Цикл выполнен',
    idle_detected: 'Простой',
    safe_behavior: 'Соблюдение ТБ',
};

export function VideoOpsPage() {
    const data = useData();
    const dispatch = useDataDispatch();
    const { addToast } = useUi();

    const [selectedCameraId, setSelectedCameraId] = useState(data.cameras?.[0]?.id || 'cam-1');
    const [simulationActive, setSimulationActive] = useState(false);

    const cameras = data.cameras || [];
    const events = data.videoEvents || [];
    const employees = data.employees || [];
    const kpi = data.kpiMetrics || {};

    const selectedCamera = cameras.find(c => c.id === selectedCameraId);

    // Фильтруем события для выбранной камеры
    const cameraEvents = useMemo(() => {
        return events.filter(e => e.cameraId === selectedCameraId)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }, [events, selectedCameraId]);

    // --- СИМУЛЯЦИЯ ПОТОКА ДАННЫХ (Wow-effect) ---
    useEffect(() => {
        if (!simulationActive) return;

        const interval = setInterval(() => {
            // Генерируем случайное событие
            const types = ['cycle_completed', 'idle_detected', 'ppe_missing', 'phone_use'];
            const randomType = types[Math.floor(Math.random() * types.length)];

            const newEvent = {
                id: `evt-${Date.now()}`,
                cameraId: selectedCameraId,
                employeeId: selectedCamera?.employeeId,
                type: randomType,
                severity: randomType === 'phone_use' ? 'critical' : randomType === 'ppe_missing' ? 'high' : 'low',
                message: `${EVENT_LABELS[randomType]} (симуляция)`,
                timestamp: new Date().toISOString(),
                acknowledged: false,
            };

            dispatch({
                type: 'ADD',
                entity: 'videoEvents',
                item: newEvent,
            });

            // Обновляем KPI
            if (selectedCamera?.employeeId) {
                const empId = selectedCamera.employeeId;
                const currentKpi = kpi[empId] || { score: 80, violations: 0, cycles: 0, idleMinutes: 0 };

                let updatedKpi = { ...currentKpi };

                if (randomType === 'cycle_completed') {
                    updatedKpi.cycles += 1;
                    updatedKpi.score = Math.min(100, updatedKpi.score + 1);
                } else if (randomType === 'idle_detected') {
                    updatedKpi.idleMinutes += 1;
                    updatedKpi.score = Math.max(0, updatedKpi.score - 2);
                } else if (['ppe_missing', 'phone_use'].includes(randomType)) {
                    updatedKpi.violations += 1;
                    updatedKpi.safetyScore = Math.max(0, updatedKpi.safetyScore - 5);
                    updatedKpi.score = Math.max(0, updatedKpi.score - 5);
                }

                dispatch({
                    type: 'UPDATE',
                    entity: 'kpiMetrics', // Требует поддержки этого entity в reducer или специального экшена
                    id: empId,
                    patch: updatedKpi,
                });
            }

        }, 3000); // Каждые 3 секунды новое событие

        return () => clearInterval(interval);
    }, [simulationActive, selectedCameraId, selectedCamera, kpi, dispatch]);

    // Хелпер получения имени сотрудника
    const getEmpName = (id) => employees.find(e => e.id === id)?.name || '—';

    return (
        <div className="stack">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2>🎥 Видеоконтроль работ</h2>
                <Button
                    variant={simulationActive ? 'danger' : 'primary'}
                    onClick={() => setSimulationActive(!simulationActive)}
                >
                    {simulationActive ? '⏸ Остановить симуляцию' : '▶ Включить Live-режим'}
                </Button>
            </div>

            <div className="grid grid-2" style={{ gap: 20 }}>

                {/* Левая колонка: Видео */}
                <div className="stack">
                    <Card title={`Камера: ${selectedCamera?.name}`} subtitle={selectedCamera?.zone}>
                        <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#000', borderRadius: 12, overflow: 'hidden' }}>
                            <video
                                src={DEMO_VIDEO_URL}
                                autoPlay
                                loop
                                muted
                                playsInline
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />

                            {/* Overlay Grid (Сетка анализа) */}
                            <div style={{
                                position: 'absolute', inset: 0,
                                backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                                backgroundSize: '50px 50px',
                                pointerEvents: 'none'
                            }} />

                            {/* HUD Info */}
                            <div style={{
                                position: 'absolute', top: 10, left: 10, right: 10,
                                display: 'flex', justifyContent: 'space-between', color: '#fff', fontSize: 12, fontWeight: 700, textShadow: '0 1px 3px black'
                            }}>
                                <span>LIVE • {selectedCamera?.status.toUpperCase()}</span>
                                <span>{new Date().toLocaleTimeString()}</span>
                            </div>

                            {/* Fake Detection Box */}
                            {cameraEvents.length > 0 && (
                                <div style={{
                                    position: 'absolute', top: '30%', left: '40%', width: '20%', height: '30%',
                                    border: `2px solid ${SEVERITY_COLORS[cameraEvents[0].severity]}`,
                                    boxShadow: `0 0 10px ${SEVERITY_COLORS[cameraEvents[0].severity]}`
                                }}>
                                    <span style={{
                                        position: 'absolute', top: '-20px', left: 0,
                                        background: SEVERITY_COLORS[cameraEvents[0].severity], color: '#000',
                                        padding: '2px 6px', fontSize: 10, fontWeight: 800, borderRadius: 4
                                    }}>
                                        {EVENT_LABELS[cameraEvents[0].type]}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div style={{ marginTop: 12 }}>
                            <Select
                                label="Выбор камеры"
                                value={selectedCameraId}
                                onChange={(e) => setSelectedCameraId(e.target.value)}
                                options={cameras.map(cam => ({ value: cam.id, label: `${cam.name} (${cam.status})` }))}
                            />
                        </div>
                    </Card>

                    {/* Лента событий этой камеры */}
                    <Card title="Последние события AI" padded={false}>
                        <div style={{ maxHeight: 200, overflowY: 'auto', padding: 12 }}>
                            {cameraEvents.length === 0 ? (
                                <EmptyState icon="✅" title="Нарушений нет" description="Работа идет штатно" />
                            ) : (
                                cameraEvents.slice(0, 10).map(evt => (
                                    <div key={evt.id} style={{
                                        display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)'
                                    }}>
                                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: SEVERITY_COLORS[evt.severity] }} />
                                        <div style={{ flex: 1 }}>
                                            <strong style={{ fontSize: 13 }}>{EVENT_LABELS[evt.type]}</strong>
                                            <p style={{ margin: 0, fontSize: 11, color: 'var(--muted)' }}>{evt.message}</p>
                                        </div>
                                        <small style={{ fontSize: 10, color: 'var(--dim)' }}>
                                            {new Date(evt.timestamp).toLocaleTimeString()}
                                        </small>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>

                {/* Правая колонка: KPI Мастеров */}
                <div className="stack">
                    <Card title="Рейтинг сотрудников (KPI)" subtitle="На основе видеоаналитики за сегодня">
                        <div className="stack" style={{ gap: 12 }}>
                            {employees.map(emp => {
                                const metrics = kpi[emp.id] || { score: 0, violations: 0, cycles: 0 };
                                const scoreColor = metrics.score >= 85 ? 'var(--success)' : metrics.score >= 70 ? 'var(--warning)' : 'var(--danger)';

                                return (
                                    <div key={emp.id} style={{
                                        padding: 12, borderRadius: 12, background: 'var(--surface-2)', border: '1px solid var(--border)'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                                <Avatar name={emp.name} size={32} />
                                                <div>
                                                    <strong style={{ fontSize: 14 }}>{emp.name}</strong>
                                                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{emp.specialization}</div>
                                                </div>
                                            </div>

                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: 24, fontWeight: 800, color: scoreColor }}>{metrics.score}</div>
                                                <div style={{ fontSize: 10, color: 'var(--muted)' }}>SCORE</div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, fontSize: 12 }}>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ color: 'var(--muted)' }}>Циклы</div>
                                                <strong>{metrics.cycles}</strong>
                                            </div>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ color: 'var(--muted)' }}>Нарушения</div>
                                                <strong style={{ color: metrics.violations > 0 ? 'var(--danger)' : 'inherit' }}>{metrics.violations}</strong>
                                            </div>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ color: 'var(--muted)' }}>Безопасность</div>
                                                <strong>{metrics.safetyScore || 100}%</strong>
                                            </div>
                                        </div>

                                        {/* Прогресс бар рейтинга */}
                                        <div style={{ marginTop: 8, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                                            <div style={{ width: `${metrics.score}%`, height: '100%', background: scoreColor, transition: 'width 0.3s ease' }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>

                    <Card title="Быстрые действия">
                        <Button fullWidth variant="secondary" onClick={() => addToast({ title: 'Экспорт отчета', description: 'PDF отчет по KPI формируется...' })}>
                            📄 Скачать отчет по KPI
                        </Button>
                        <div style={{ marginTop: 10 }}>
                            <Button fullWidth variant="ghost" onClick={() => addToast({ title: 'Журнал', description: 'Открывается полный лог всех событий' })}>
                                📋 Полный журнал событий
                            </Button>
                        </div>
                    </Card>
                </div>

            </div>
        </div>
    );
}
