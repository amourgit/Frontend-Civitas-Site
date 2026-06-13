"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { AlertTriangle, AlertCircle, CheckCircle, LucideIcon } from "lucide-react"

export interface ValidationRule {
  regex: RegExp
  message: string
  type: "warning" | "error" | "success"
}

export interface ValidationConfig {
  rules: ValidationRule[]
  realTimeValidation?: boolean
  triggerVibration?: boolean
  showIcons?: boolean
  showMessages?: boolean
}

export interface FieldIcon {
  icon: LucideIcon
  position?: "left" | "label"
}

export interface BaseFieldProps {
  // Propriétés de base
  label?: string
  placeholder?: string
  type?: "text" | "email" | "password" | "tel" | "url" | "number" | "search"
  value?: string
  onChange?: (value: string) => void
  className?: string
  disabled?: boolean
  required?: boolean
  autoComplete?: string
  autoFocus?: boolean
  
  // Icône de champ (différente de l'icône de validation)
  fieldIcon?: FieldIcon
  
  // Configuration de validation
  validation?: ValidationConfig
  
  // Callbacks personnalisés
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
  onValidationChange?: (validation: ValidationRule | null) => void
}

const defaultValidation: ValidationConfig = {
  rules: [],
  realTimeValidation: true,
  triggerVibration: true,
  showIcons: true,
  showMessages: true
}

const defaultIcons = {
  warning: AlertTriangle,
  error: AlertCircle,
  success: CheckCircle,
}

const useFieldValidation = (
  inputValue: string,
  validation: ValidationConfig,
  onValidationChange?: (validation: ValidationRule | null) => void
) => {
  const [currentValidation, setCurrentValidation] = useState<ValidationRule | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)

  const triggerVibration = (type: "warning" | "error" | "success") => {
    if (!validation.triggerVibration) return

    setIsAnimating(true)

    // Vibration du navigateur si supportée
    if (navigator.vibrate) {
      const vibrationPatterns = {
        error: [100, 50, 100],
        warning: [50, 30, 50],
        success: [30]
      }
      navigator.vibrate(vibrationPatterns[type])
    }

    // Animation CSS
    setTimeout(() => setIsAnimating(false), 600)
  }

  // Validation en temps réel
  useEffect(() => {
    if (!validation.realTimeValidation || !inputValue || validation.rules.length === 0) {
      const newValidation = null
      setCurrentValidation(newValidation)
      onValidationChange?.(newValidation)
      return
    }

    // Trouve la première règle qui ne passe pas
    const failedRule = validation.rules.find((rule) => !rule.regex.test(inputValue))

    if (failedRule) {
      if (currentValidation?.type !== failedRule.type) {
        triggerVibration(failedRule.type)
      }
      setCurrentValidation(failedRule)
      onValidationChange?.(failedRule)
    } else {
      // Toutes les règles passent - cherche une règle de succès
      const successRule = validation.rules.find((rule) => rule.type === "success" && rule.regex.test(inputValue))
      if (successRule && currentValidation?.type !== "success") {
        triggerVibration("success")
        setCurrentValidation(successRule)
        onValidationChange?.(successRule)
      } else if (!successRule) {
        const newValidation = null
        setCurrentValidation(newValidation)
        onValidationChange?.(newValidation)
      }
    }
  }, [inputValue, validation.rules, validation.realTimeValidation, currentValidation?.type, onValidationChange])

  return { currentValidation, isAnimating }
}

// Composant pour l'icône de validation avec animation de slide
const ValidationIcon: React.FC<{
  currentValidation: ValidationRule | null
  showIcons: boolean
}> = ({ currentValidation, showIcons }) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (currentValidation && showIcons) {
      // Petit délai avant de déclencher l'animation
      setTimeout(() => setIsVisible(true), 50)
    } else {
      setIsVisible(false)
    }
  }, [currentValidation, showIcons])

  if (!showIcons || !currentValidation) return null

  const IconComponent = defaultIcons[currentValidation.type as keyof typeof defaultIcons]
  if (!IconComponent) return null

  const getIconColor = () => {
    switch (currentValidation.type) {
      case "success":
        return "text-green-500"
      case "error":
        return "text-red-500"
      case "warning":
        return "text-blue-500"
      default:
        return "text-gray-500"
    }
  }

  return (
    <div
      className={`
        absolute right-3 top-1/2 transform -translate-y-1/2 z-10
        transition-all duration-500 ease-out
        ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"}
      `}
      style={{
        transitionProperty: "opacity, transform"
      }}
    >
      <IconComponent className={`h-5 w-5 ${getIconColor()} transition-colors duration-500`} />
    </div>
  )
}

// Composant pour l'icône de champ (left ou label)
const FieldIconComponent: React.FC<{
  fieldIcon?: FieldIcon
  validationColor?: string
}> = ({ fieldIcon, validationColor }) => {
  if (!fieldIcon) return null

  const IconComponent = fieldIcon.icon
  const colorClass = validationColor || "bg-transparent text-white"

  return (
    <IconComponent 
      className={`h-4 w-4 ${colorClass} transition-colors duration-500`}
    />
  )
}

// Composant FilledField
export const FilledField: React.FC<BaseFieldProps> = ({
  label,
  placeholder = " ",
  type = "text",
  value = "",
  onChange,
  className = "",
  disabled = false,
  required = false,
  autoComplete,
  autoFocus,
  fieldIcon,
  validation = defaultValidation,
  onFocus,
  onBlur,
  onValidationChange,
}) => {
  const [inputValue, setInputValue] = useState(value)
  const [isFocused, setIsFocused] = useState(false)
  const fieldRef = useRef<HTMLDivElement>(null)

  const { currentValidation, isAnimating } = useFieldValidation(
    inputValue,
    validation,
    onValidationChange
  )

  // Synchronisation avec la valeur externe
  useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value)
    }
  }, [value, inputValue])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    onChange?.(newValue)
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true)
    onFocus?.(e)
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false)
    onBlur?.(e)
  }

  const getValidationClasses = () => {
    if (!currentValidation) return {
      border: "border-gray-300 dark:border-gray-600",
      label: "text-gray-500 dark:text-gray-400",
      input: "text-gray-900 dark:text-white",
      message: "",
      focus: "focus:border-blue-600 dark:focus:border-blue-500"
    }

    switch (currentValidation.type) {
      case "success":
        return {
          border: "border-green-600 dark:border-green-500",
          label: "text-green-600 dark:text-green-500",
          input: "text-green-600 dark:text-green-500",
          message: "text-green-600 dark:text-green-400",
          focus: "focus:border-green-600 dark:focus:border-green-500"
        }
      case "error":
        return {
          border: "border-red-600 dark:border-red-500",
          label: "text-red-600 dark:text-red-500",
          input: "text-red-600 dark:text-red-500",
          message: "text-red-600 dark:text-red-400",
          focus: "focus:border-red-600 dark:focus:border-red-500"
        }
      case "warning":
        return {
          border: "border-blue-600 dark:border-blue-500",
          label: "text-blue-600 dark:text-blue-500",
          input: "text-blue-600 dark:text-blue-500",
          message: "text-blue-600 dark:text-blue-400",
          focus: "focus:border-blue-600 dark:focus:border-blue-500"
        }
      default:
        return {
          border: "border-gray-300 dark:border-gray-600",
          label: "text-white dark:text-gray-400",
          input: "text-gray-900 dark:text-white",
          message: "",
          focus: "focus:border-blue-600 dark:focus:border-blue-500"
        }
    }
  }

  const validationClasses = getValidationClasses()
  const hasLeftIcon = fieldIcon?.position === "left"
  const hasLabelIcon = fieldIcon?.position === "label"

  return (
    <div className={className}>
      <div className="relative" ref={fieldRef}>
        {/* Icône à gauche du champ */}
        {hasLeftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
            <FieldIconComponent fieldIcon={fieldIcon} validationColor={validationClasses.label} />
          </div>
        )}

        <input
          type={type}
          id={`filled_${label?.toLowerCase().replace(/\s+/g, '_')}`}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          className={`
            block rounded-t-lg pb-2.5 pt-5 w-full text-sm bg-transparent 
            border-0 border-b-2 appearance-none
            focus:outline-none focus:ring-0 peer transition-all duration-500
            ${validationClasses.border} ${validationClasses.focus} ${validationClasses.input}
            ${isAnimating ? 'animate-pulse' : ''}
            ${hasLeftIcon ? 'pl-10 pr-2.5' : 'px-2.5'}
            ${validation.showIcons && currentValidation ? 'pr-12' : ''}
            disabled:cursor-not-allowed disabled:opacity-50
          `}
          style={{
            backgroundColor: 'rgba(0,0,0,0)',
            WebkitBoxShadow: '0 0 0 1000px rgba(0,0,0,0) inset',
            WebkitTextFillColor: '#ffffff',
            WebkitAppearance: 'none',
            MozAppearance: 'textfield',
            colorScheme: 'dark',
          } as React.CSSProperties}
          placeholder={placeholder}
          aria-describedby={validation.showMessages && currentValidation ? `filled_${label?.toLowerCase().replace(/\s+/g, '_')}_help` : undefined}
        />
        
        {label && (
          <label
            htmlFor={`filled_${label?.toLowerCase().replace(/\s+/g, '_')}`}
            className={`
              absolute text-sm duration-500 transform -translate-y-4 scale-75 top-4 z-10 origin-[0]
              peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 
              peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto
              flex items-center gap-1.5 bg-transparent text-white
              ${hasLeftIcon ? 'start-10' : 'start-2.5'}
              ${validationClasses.label}
            `}
          >
            {hasLabelIcon && <FieldIconComponent fieldIcon={fieldIcon} validationColor={validationClasses.label} />}
            <span>
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </span>
          </label>
        )}
        
        <ValidationIcon 
          currentValidation={currentValidation} 
          showIcons={validation.showIcons || false}
        />
      </div>
      
      {validation.showMessages && currentValidation && (
        <p 
          id={`filled_${label?.toLowerCase().replace(/\s+/g, '_')}_help`}
          className={`mt-2 text-xs ${validationClasses.message} transition-all duration-500 opacity-0 animate-fadeIn`}
          style={{
            animation: "fadeIn 0.5s ease-out forwards"
          }}
        >
          <span className="font-medium">
            {currentValidation.type === 'success' && 'Well done!'}
            {currentValidation.type === 'error' && 'Oh, snapp!'}
            {currentValidation.type === 'warning' && 'Attention!'}
          </span>{' '}
          {currentValidation.message}
        </p>
      )}
      
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

// Composant OutlinedField
export const OutlinedField: React.FC<BaseFieldProps> = ({
  label,
  placeholder = " ",
  type = "text",
  value = "",
  onChange,
  className = "",
  disabled = false,
  required = false,
  autoComplete,
  autoFocus,
  fieldIcon,
  validation = defaultValidation,
  onFocus,
  onBlur,
  onValidationChange,
}) => {
  const [inputValue, setInputValue] = useState(value)
  const [isFocused, setIsFocused] = useState(false)
  const fieldRef = useRef<HTMLDivElement>(null)

  const { currentValidation, isAnimating } = useFieldValidation(
    inputValue,
    validation,
    onValidationChange
  )

  // Synchronisation avec la valeur externe
  useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value)
    }
  }, [value, inputValue])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    onChange?.(newValue)
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true)
    onFocus?.(e)
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false)
    onBlur?.(e)
  }

  const getValidationClasses = () => {
    if (!currentValidation) return {
      border: "border-gray-300 dark:border-gray-600",
      label: "bg-transparent text-white dark:text-gray-400",
      input: "bg-transparent text-white dark:text-white",
      message: "",
      focus: "focus:border-blue-600 dark:focus:border-blue-500"
    }

    switch (currentValidation.type) {
      case "success":
        return {
          border: "border-green-600 dark:border-green-500",
          label: "text-green-600 dark:text-green-500",
          input: "text-green-600 dark:text-green-500",
          message: "text-green-600 dark:text-green-400",
          focus: "focus:border-green-600 dark:focus:border-green-500"
        }
      case "error":
        return {
          border: "border-red-600 dark:border-red-500",
          label: "text-red-600 dark:text-red-500",
          input: "text-red-600 dark:text-red-500",
          message: "text-red-600 dark:text-red-400",
          focus: "focus:border-red-600 dark:focus:border-red-500"
        }
      case "warning":
        return {
          border: "border-blue-600 dark:border-blue-500",
          label: "text-blue-600 dark:text-blue-500",
          input: "text-blue-600 dark:text-blue-500",
          message: "text-blue-600 dark:text-blue-400",
          focus: "focus:border-blue-600 dark:focus:border-blue-500"
        }
      default:
        return {
          border: "border-gray-300 dark:border-gray-600",
          label: "text-white dark:text-gray-400 bg-transparent text-white",
          input: "text-gray-900 dark:text-white",
          message: "",
          focus: "focus:border-blue-600 dark:focus:border-blue-500"
        }
    }
  }

  const validationClasses = getValidationClasses()
  const hasLeftIcon = fieldIcon?.position === "left"
  const hasLabelIcon = fieldIcon?.position === "label"

  return (
    <div className={className}>
      <div className="relative" ref={fieldRef}>
        {/* Icône à gauche du champ */}
        {hasLeftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10 bg-transparent text-white">
            <FieldIconComponent fieldIcon={fieldIcon} validationColor={validationClasses.label} />
          </div>
        )}

        <input
          type={type}
          id={`outlined_${label?.toLowerCase().replace(/\s+/g, '_')}`}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          className={`
            block pb-2.5 pt-4 w-full text-sm bg-transparent rounded-lg 
            border-1 appearance-none focus:outline-none focus:ring-0 peer
            transition-all duration-500 text-white
            ${validationClasses.border} ${validationClasses.focus} ${validationClasses.input}
            ${isAnimating ? 'animate-pulse' : ''}
            ${hasLeftIcon ? 'pl-10 pr-2.5' : 'px-2.5'}
            ${validation.showIcons && currentValidation ? 'pr-12' : ''}
            disabled:cursor-not-allowed disabled:opacity-50
          `}
          style={{
            backgroundColor: 'rgba(0,0,0,0)',
            WebkitBoxShadow: '0 0 0 1000px rgba(0,0,0,0) inset',
            WebkitTextFillColor: '#ffffff',
            WebkitAppearance: 'none',
            MozAppearance: 'textfield',
            colorScheme: 'dark',
          } as React.CSSProperties}
          placeholder={placeholder}
          aria-describedby={validation.showMessages && currentValidation ? `outlined_${label?.toLowerCase().replace(/\s+/g, '_')}_help` : undefined}
        />
        
        {label && (
          <label
            htmlFor={`outlined_${label?.toLowerCase().replace(/\s+/g, '_')}`}
            className={`
              absolute text-sm duration-500 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] 
              dark:bg-gray-900 px-2 peer-focus:px-2 peer-placeholder-shown:scale-100 
              peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 
              peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 
              rtl:peer-focus:left-auto flex items-center gap-1.5 bg-transparent text-white
              ${hasLeftIcon ? 'start-8' : 'start-1'}
              ${validationClasses.label}
            `}
          >
            {hasLabelIcon && <FieldIconComponent fieldIcon={fieldIcon} validationColor={validationClasses.label} />}
            <span>
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </span>
          </label>
        )}
        
        <ValidationIcon 
          currentValidation={currentValidation} 
          showIcons={validation.showIcons || false}
        />
      </div>
      
      {validation.showMessages && currentValidation && (
        <p 
          id={`outlined_${label?.toLowerCase().replace(/\s+/g, '_')}_help`}
          className={`mt-2 text-xs ${validationClasses.message} transition-all duration-500 opacity-0 animate-fadeIn`}
          style={{
            animation: "fadeIn 0.5s ease-out forwards"
          }}
        >
          <span className="font-medium">
            {currentValidation.type === 'success' && 'Well done!'}
            {currentValidation.type === 'error' && 'Oh, snapp!'}
            {currentValidation.type === 'warning' && 'Attention!'}
          </span>{' '}
          {currentValidation.message}
        </p>
      )}
      
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

// Composant StandardField
export const StandardField: React.FC<BaseFieldProps> = ({
  label,
  placeholder = " ",
  type = "text",
  value = "",
  onChange,
  className = "",
  disabled = false,
  required = false,
  autoComplete,
  autoFocus,
  fieldIcon,
  validation = defaultValidation,
  onFocus,
  onBlur,
  onValidationChange,
}) => {
  const [inputValue, setInputValue] = useState(value)
  const [isFocused, setIsFocused] = useState(false)
  const fieldRef = useRef<HTMLDivElement>(null)

  const { currentValidation, isAnimating } = useFieldValidation(
    inputValue,
    validation,
    onValidationChange
  )

  // Synchronisation avec la valeur externe
  useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value)
    }
  }, [value, inputValue])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    onChange?.(newValue)
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true)
    onFocus?.(e)
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false)
    onBlur?.(e)
  }

  const getValidationClasses = () => {
    if (!currentValidation) return {
      border: "border-gray-300 dark:border-gray-600",
      label: "text-gray-500 dark:text-gray-400",
      input: "text-gray-900 dark:text-white",
      message: "",
      focus: "focus:border-blue-600 dark:focus:border-blue-500"
    }

    switch (currentValidation.type) {
      case "success":
        return {
          border: "border-green-600 dark:border-green-500",
          label: "text-green-600 dark:text-green-500",
          input: "text-green-600 dark:text-green-500",
          message: "text-green-600 dark:text-green-400",
          focus: "focus:border-green-600 dark:focus:border-green-500"
        }
      case "error":
        return {
          border: "border-red-600 dark:border-red-500",
          label: "text-red-600 dark:text-red-500",
          input: "text-red-600 dark:text-red-500",
          message: "text-red-600 dark:text-red-400",
          focus: "focus:border-red-600 dark:focus:border-red-500"
        }
      case "warning":
        return {
          border: "border-blue-600 dark:border-blue-500",
          label: "text-blue-600 dark:text-blue-500",
          input: "text-blue-600 dark:text-blue-500",
          message: "text-blue-600 dark:text-blue-400",
          focus: "focus:border-blue-600 dark:focus:border-blue-500"
        }
      default:
        return {
          border: "border-gray-300 dark:border-gray-600",
          label: "dark:text-gray-400 bg-transparent text-white",
          input: "text-gray-900 dark:text-white",
          message: "",
          focus: "focus:border-blue-600 dark:focus:border-blue-500"
        }
    }
  }

  const validationClasses = getValidationClasses()
  const hasLeftIcon = fieldIcon?.position === "left"
  const hasLabelIcon = fieldIcon?.position === "label"

  return (
    <div className={className}>
      <div className="relative z-0" ref={fieldRef}>
        {/* Icône à gauche du champ */}
        {hasLeftIcon && (
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10">
            <FieldIconComponent fieldIcon={fieldIcon} validationColor={validationClasses.label} />
          </div>
        )}

        <input
          type={type}
          id={`standard_${label?.toLowerCase().replace(/\s+/g, '_')}`}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          className={`
            block py-2.5 w-full text-sm bg-transparent border-0 border-b-2 
            appearance-none focus:outline-none focus:ring-0 peer
            transition-all duration-500
            ${validationClasses.border} ${validationClasses.focus} ${validationClasses.input}
            ${isAnimating ? 'animate-pulse' : ''}
            ${hasLeftIcon ? 'pl-6 pr-0' : 'px-0'}
            ${validation.showIcons && currentValidation ? 'pr-12' : ''}
            disabled:cursor-not-allowed disabled:opacity-50
          `}
          style={{
            backgroundColor: 'rgba(0,0,0,0)',
            WebkitBoxShadow: '0 0 0 1000px rgba(0,0,0,0) inset',
            WebkitTextFillColor: '#ffffff',
            WebkitAppearance: 'none',
            MozAppearance: 'textfield',
            colorScheme: 'dark',
          } as React.CSSProperties}
          placeholder={placeholder}
          aria-describedby={validation.showMessages && currentValidation ? `standard_${label?.toLowerCase().replace(/\s+/g, '_')}_help` : undefined}
        />
        
        {label && (
          <label
            htmlFor={`standard_${label?.toLowerCase().replace(/\s+/g, '_')}`}
            className={`
              absolute text-sm duration-500 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] 
              peer-focus:start-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 
              peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 
              rtl:peer-focus:left-auto flex items-center gap-1.5 bg-transparent text-white
              ${hasLeftIcon ? 'start-6' : 'start-0'}
              ${validationClasses.label}
            `}
          >
            {hasLabelIcon && <FieldIconComponent fieldIcon={fieldIcon} validationColor={validationClasses.label} />}
            <span>
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </span>
          </label>
        )}
        
        <ValidationIcon 
          currentValidation={currentValidation} 
          showIcons={validation.showIcons || false}
        />
      </div>
      
      {validation.showMessages && currentValidation && (
        <p 
          id={`standard_${label?.toLowerCase().replace(/\s+/g, '_')}_help`}
          className={`mt-2 text-xs ${validationClasses.message} transition-all duration-500 opacity-0 animate-fadeIn`}
          style={{
            animation: "fadeIn 0.5s ease-out forwards"
          }}
        >
          <span className="font-medium">
            {currentValidation.type === 'success' && 'Well done!'}
            {currentValidation.type === 'error' && 'Oh, snapp!'}
            {currentValidation.type === 'warning' && 'Attention!'}
          </span>{' '}
          {currentValidation.message}
        </p>
      )}
      
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}