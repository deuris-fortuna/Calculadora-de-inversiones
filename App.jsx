import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PlusCircle, Trash2, TrendingUp, Target } from 'lucide-react';

export default function InvestmentCalculator() {
  const [children, setChildren] = useState([
    { id: 1, name: 'Hijo 1', initialAmount: 10000, monthlyContribution: 500, age: 5, targetAge: 18 }
  ]);
  const [timeHorizon, setTimeHorizon] = useState(18);
  const [interestRates, setInterestRates] = useState([
    { year: 0, rate: 7 }
  ]);
  const [viewMode, setViewMode] = useState('general');

  const addChild = () => {
    setChildren([...children, {
      id: Date.now(),
      name: `Hijo ${children.length + 1}`,
      initialAmount: 0,
      monthlyContribution: 0,
      age: 0,
      targetAge: 18
    }]);
  };

  const removeChild = (id) => {
    if (children.length > 1) {
      setChildren(children.filter(c => c.id !== id));
    }
  };

  const updateChild = (id, field, value) => {
    setChildren(children.map(c => 
      c.id === id ? { ...c, [field]: field === 'name' ? value : (parseFloat(value) || 0) } : c
    ));
  };

  const addInterestRate = () => {
    const lastYear = interestRates.length > 0 
      ? Math.max(...interestRates.map(r => r.year)) + 1 
      : 0;
    setInterestRates([...interestRates, { year: lastYear, rate: 7 }]);
  };

  const removeInterestRate = (index) => {
    if (interestRates.length > 1) {
      setInterestRates(interestRates.filter((_, i) => i !== index));
    }
  };

  const updateInterestRate = (index, field, value) => {
    setInterestRates(interestRates.map((r, i) => 
      i === index ? { ...r, [field]: parseFloat(value) || 0 } : r
    ));
  };

  const calculateInvestment = (child) => {
    const sortedRates = [...interestRates].sort((a, b) => a.year - b.year);
    const yearsToTarget = Math.max(0, child.targetAge - child.age);
    let balance = child.initialAmount;
    const yearlyData = [];
    
    for (let year = 0; year <= yearsToTarget; year++) {
      const currentRate = sortedRates.reduce((rate, r) => 
        r.year <= year ? r.rate : rate, sortedRates[0].rate
      ) / 100;
      
      for (let month = 0; month < 12; month++) {
        balance += child.monthlyContribution;
        balance *= (1 + currentRate / 12);
      }
      
      yearlyData.push({
        year,
        balance: Math.round(balance),
        childAge: child.age + year,
        contributions: child.initialAmount + (child.monthlyContribution * 12 * year),
        interest: Math.round(balance - (child.initialAmount + child.monthlyContribution * 12 * year))
      });
    }
    
    return yearlyData;
  };

  const allData = useMemo(() => {
    const chartData = [];
    const maxYears = viewMode === 'general' 
      ? timeHorizon 
      : Math.max(...children.map(c => Math.max(0, c.targetAge - c.age)));
    
    for (let year = 0; year <= maxYears; year++) {
      const dataPoint = { year };
      children.forEach(child => {
        const childData = calculateInvestment(child);
        if (year < childData.length) {
          dataPoint[child.name] = childData[year].balance;
          dataPoint[`${child.name}_age`] = childData[year].childAge;
        }
      });
      chartData.push(dataPoint);
    }
    return chartData;
  }, [children, timeHorizon, interestRates, viewMode]);

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">Calculadora de Fondos de Inversión</h1>
          </div>

          <div className="mb-6 flex gap-4 justify-center">
            <button
              onClick={() => setViewMode('general')}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                viewMode === 'general' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Vista General
            </button>
            <button
              onClick={() => setViewMode('individual')}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                viewMode === 'individual' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Vista Individual por Edad
            </button>
          </div>

          {viewMode === 'general' && (
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Horizonte de Tiempo General (años)
                </label>
                <input
                  type="number"
                  value={timeHorizon}
                  onChange={(e) => setTimeHorizon(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                />
              </div>
            </div>
          )}

          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Tasas de Interés Anuales</h2>
              <button
                onClick={addInterestRate}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              >
                <PlusCircle className="w-4 h-4" />
                Agregar Tasa
              </button>
            </div>
            <div className="space-y-3">
              {interestRates.sort((a, b) => a.year - b.year).map((rate, index) => (
                <div key={index} className="flex gap-3 items-center bg-gray-50 p-4 rounded-lg">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Desde el año
                    </label>
                    <input
                      type="number"
                      value={rate.year}
                      onChange={(e) => updateInterestRate(index, 'year', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      min="0"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Tasa (%)
                    </label>
                    <input
                      type="number"
                      value={rate.rate}
                      onChange={(e) => updateInterestRate(index, 'rate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      step="0.1"
                    />
                  </div>
                  {interestRates.length > 1 && (
                    <button
                      onClick={() => removeInterestRate(index)}
                      className="mt-5 p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Hijos / Cuentas</h2>
              <button
                onClick={addChild}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                <PlusCircle className="w-4 h-4" />
                Agregar Hijo
              </button>
            </div>
            <div className="space-y-4">
              {children.map((child) => {
                const yearsToTarget = Math.max(0, child.targetAge - child.age);
                const finalData = calculateInvestment(child);
                const atTarget = finalData[yearsToTarget] || finalData[finalData.length - 1];
                
                return (
                  <div key={child.id} className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-lg border-2 border-blue-200">
                    <div className="flex items-center justify-between mb-4">
                      <input
                        type="text"
                        value={child.name}
                        onChange={(e) => updateChild(child.id, 'name', e.target.value)}
                        className="text-lg font-bold bg-transparent border-b-2 border-blue-300 focus:border-blue-500 outline-none px-2 py-1"
                      />
                      {children.length > 1 && (
                        <button
                          onClick={() => removeChild(child.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                    <div className="grid md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Monto Inicial ($)
                        </label>
                        <input
                          type="number"
                          value={child.initialAmount}
                          onChange={(e) => updateChild(child.id, 'initialAmount', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Aporte Mensual ($)
                        </label>
                        <input
                          type="number"
                          value={child.monthlyContribution}
                          onChange={(e) => updateChild(child.id, 'monthlyContribution', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Edad Actual
                        </label>
                        <input
                          type="number"
                          value={child.age}
                          onChange={(e) => updateChild(child.id, 'age', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          Edad Meta
                        </label>
                        <input
                          type="number"
                          value={child.targetAge}
                          onChange={(e) => updateChild(child.id, 'targetAge', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          min={child.age}
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4 grid md:grid-cols-2 gap-3">
                      <div className="p-3 bg-white rounded-lg border-2 border-green-200">
                        <div className="flex items-center gap-2 mb-1">
                          <Target className="w-4 h-4 text-green-600" />
                          <p className="text-xs font-semibold text-gray-600">
                            A los {child.targetAge} años (en {yearsToTarget} años):
                          </p>
                        </div>
                        <p className="font-bold text-green-600 text-2xl">
                          ${atTarget?.balance.toLocaleString() || 0}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Aportes: ${atTarget?.contributions.toLocaleString() || 0} | 
                          Intereses: ${atTarget?.interest.toLocaleString() || 0}
                        </p>
                      </div>
                      
                      {child.targetAge !== 18 && (
                        <div className="p-3 bg-white rounded-lg border-2 border-blue-200">
                          <p className="text-xs font-semibold text-gray-600 mb-1">
                            Al ser mayor de edad (18 años):
                          </p>
                          <p className="font-bold text-blue-600 text-2xl">
                            ${(() => {
                              const yearsTo18 = Math.max(0, 18 - child.age);
                              const at18Data = calculateInvestment({...child, targetAge: 18});
                              const at18 = at18Data[yearsTo18];
                              return at18?.balance.toLocaleString() || 0;
                            })()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {viewMode === 'general' ? 'Proyección General de Inversión' : 'Proyección Individual por Edad Meta'}
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={allData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="year" 
                  label={{ value: 'Años', position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  label={{ value: 'Monto ($)', angle: -90, position: 'insideLeft' }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(value, name) => {
                    const childName = name.replace('_age', '');
                    return [`$${value.toLocaleString()}`, childName];
                  }}
                  labelFormatter={(label) => `Año ${label}`}
                />
                <Legend />
                {children.map((child, index) => (
                  <Line 
                    key={child.id}
                    type="monotone" 
                    dataKey={child.name} 
                    stroke={colors[index % colors.length]}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">📊 Resumen por Hijo</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {children.map((child) => {
                const yearsTo18 = Math.max(0, 18 - child.age);
                const yearsToTarget = Math.max(0, child.targetAge - child.age);
                const dataToTarget = calculateInvestment(child);
                const at18 = yearsTo18 < dataToTarget.length ? dataToTarget[yearsTo18] : null;
                const atTarget = dataToTarget[yearsToTarget] || dataToTarget[dataToTarget.length - 1];
                
                return (
                  <div key={child.id} className="bg-white rounded-lg p-4 border-2 border-blue-200 shadow-md">
                    <h3 className="font-bold text-lg text-blue-600 mb-3">{child.name}</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Edad actual:</span>
                        <span className="font-semibold">{child.age} años</span>
                      </div>
                      {at18 && (
                        <>
                          <div className="flex justify-between border-t pt-2">
                            <span className="text-gray-600">A los 18 años:</span>
                            <span className="font-bold text-green-600">${at18.balance.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>En {yearsTo18} años</span>
                            <span>Intereses: ${at18.interest.toLocaleString()}</span>
                          </div>
                        </>
                      )}
                      {child.targetAge !== 18 && (
                        <>
                          <div className="flex justify-between border-t pt-2">
                            <span className="text-gray-600">A los {child.targetAge} años:</span>
                            <span className="font-bold text-purple-600">${atTarget.balance.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>En {yearsToTarget} años</span>
                            <span>Intereses: ${atTarget.interest.toLocaleString()}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
