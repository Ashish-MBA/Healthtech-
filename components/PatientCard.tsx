import React from 'react';
import { useAppStore } from '../store';
import { AlertCircle, Clock, Activity } from 'lucide-react';

export const PatientCard: React.FC = () => {
  const { currentPatient } = useAppStore();

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Profile Card */}
      <div className="bg-surface p-6 rounded-md shadow-sm border border-gray-100 text-center">
        <div className="w-24 h-24 mx-auto rounded-full overflow-hidden mb-4 border-4 border-background">
          <img src={currentPatient.avatarUrl} alt={currentPatient.name} className="w-full h-full object-cover" />
        </div>
        <h2 className="text-xl font-bold text-text-primary">{currentPatient.name}</h2>
        <p className="text-text-secondary text-sm mb-4">
          {currentPatient.age}yo • {currentPatient.gender}
        </p>
        
        <div className="grid grid-cols-2 gap-2 text-left mt-4">
          <div className="bg-background p-3 rounded-sm">
            <p className="text-xs text-text-secondary uppercase tracking-wider mb-1">Last Visit</p>
            <div className="flex items-center gap-1.5 text-text-primary font-medium text-sm">
              <Clock size={14} />
              {currentPatient.lastVisit}
            </div>
          </div>
          <div className="bg-background p-3 rounded-sm">
            <p className="text-xs text-text-secondary uppercase tracking-wider mb-1">Status</p>
            <div className="flex items-center gap-1.5 text-alert-success font-medium text-sm">
              <Activity size={14} />
              Stable
            </div>
          </div>
        </div>
      </div>

      {/* Clinical Flags */}
      <div className="bg-surface p-5 rounded-md shadow-sm border border-gray-100 flex-1">
        <h3 className="text-sm font-bold text-text-primary mb-4 uppercase tracking-wide">Clinical Context</h3>
        
        <div className="mb-6">
          <p className="text-xs text-text-secondary mb-2 flex items-center gap-1">
            <AlertCircle size={12} className="text-alert-danger" />
            Allergies
          </p>
          <div className="flex flex-wrap gap-2">
            {currentPatient.allergies.map(allergy => (
              <span key={allergy} className="px-2 py-1 bg-alert-danger/10 text-alert-danger text-xs font-semibold rounded-sm border border-alert-danger/20">
                {allergy}
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs text-text-secondary mb-2">Active Conditions</p>
          <ul className="space-y-2">
            {currentPatient.conditions.map(condition => (
              <li key={condition} className="flex items-center gap-2 text-sm text-text-primary">
                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                {condition}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
