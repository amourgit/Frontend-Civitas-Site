import { useState } from "react";
import { ChevronDown, Building2, MapPin, Users, Calendar, ChevronRight, Settings } from "lucide-react";

const StructureInfoCard = ({ 
  structure = {
    id: 1,
    name: "Mon Entreprise",
    type: "SARL",
    logo: null,
    address: "123 Rue de la Paix, 75000 Paris",
    employeeCount: 25,
    createdDate: "2020-01-01",
    status: "active"
  },
  showDropdown = false,
  availableStructures = [],
  onSelect,
  onManageStructures
}) => {
  const [showStructuresMenu, setShowStructuresMenu] = useState(false);

  const handleStructureSelect = (selectedStructure) => {
    onSelect?.(selectedStructure);
    setShowStructuresMenu(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return 'Active';
      case 'inactive': return 'Inactive';
      case 'pending': return 'En attente';
      default: return 'Inconnu';
    }
  };

  if (!structure) {
    return (
      <div className="flex items-center gap-2 px-2 py-1 bg-white/10 rounded-md">
        <Building2 className="w-4 h-4 text-white/60" />
        <span className="text-white/60 text-sm">Aucune structure</span>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Bouton principal */}
      <button
        onClick={() => showDropdown && setShowStructuresMenu(!showStructuresMenu)}
        className={`flex items-center gap-1 px-1 py-0.5 rounded-sm hover:bg-white/5 transition-colors ${
          showDropdown ? 'cursor-pointer' : 'cursor-default'
        }`}
        disabled={!showDropdown}
      >
        {/* Logo de la structure - version minimaliste */}
        <div className="flex-shrink-0">
          {structure.logo ? (
            <img 
              src={structure.logo} 
              alt={structure.name}
              className="w-4 h-4 rounded object-cover"
            />
          ) : (
            <div className="w-4 h-4 bg-teal-600 rounded flex items-center justify-center">
              <Building2 className="w-2.5 h-2.5 text-white" />
            </div>
          )}
        </div>

        {/* Informations de la structure - version ultra compacte */}
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-1">
            <span className="text-white/80 text-xs font-medium truncate block max-w-20">
              {structure.name.length > 8 ? structure.name.substring(0, 8) + '...' : structure.name}
            </span>
          </div>
        </div>

        {/* Icône dropdown - plus petite */}
        {showDropdown && (
          <ChevronDown className={`w-3 h-3 text-white/40 flex-shrink-0 transition-transform ${
            showStructuresMenu ? 'rotate-180' : ''
          }`} />
        )}
      </button>

      {/* Menu dropdown */}
      {showDropdown && showStructuresMenu && (
        <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 min-w-80 z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Changer de structure</h3>
              <button
                onClick={() => onManageStructures?.()}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
                title="Gérer les structures"
              >
                <Settings className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Structure actuelle */}
          <div className="p-4 bg-green-50 border-b border-gray-200">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                {structure.logo ? (
                  <img 
                    src={structure.logo} 
                    alt={structure.name}
                    className="w-10 h-10 rounded object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-teal-600 rounded flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-gray-900 truncate">
                    {structure.name}
                  </h4>
                  <span className="bg-green-600 text-white text-xs font-medium px-2 py-1 rounded-full">
                    Actuelle
                  </span>
                </div>
                
                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{structure.type}</span>
                  </div>
                  
                  {structure.address && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{structure.address}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    {structure.employeeCount && (
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3 flex-shrink-0" />
                        <span>{structure.employeeCount} employé{structure.employeeCount > 1 ? 's' : ''}</span>
                      </div>
                    )}
                    
                    {structure.createdDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 flex-shrink-0" />
                        <span>Depuis {formatDate(structure.createdDate)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Autres structures */}
          {availableStructures.length > 0 ? (
            <div className="max-h-60 overflow-y-auto">
              {availableStructures.map((struct) => (
                <button
                  key={struct.id}
                  onClick={() => handleStructureSelect(struct)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      {struct.logo ? (
                        <img 
                          src={struct.logo} 
                          alt={struct.name}
                          className="w-8 h-8 rounded object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-gray-500" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 truncate">
                          {struct.name}
                        </span>
                        {struct.status && (
                          <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(struct.status)}`}>
                            {getStatusLabel(struct.status)}
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-500 truncate block">
                        {struct.type}
                      </span>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              <Building2 className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Aucune autre structure disponible</p>
            </div>
          )}

          {/* Footer */}
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => onManageStructures?.()}
              className="w-full text-sm text-teal-600 hover:text-teal-700 font-medium py-2 px-3 hover:bg-teal-50 rounded transition-colors"
            >
              Gérer mes structures
            </button>
          </div>
        </div>
      )}

      {/* Overlay pour fermer le menu */}
      {showStructuresMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowStructuresMenu(false)}
        />
      )}
    </div>
  );
};

export default StructureInfoCard;