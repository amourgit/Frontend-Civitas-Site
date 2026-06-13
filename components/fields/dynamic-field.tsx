"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
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

export interface SizeConfig {
  height?: string
  fontSize?: string
  iconSize?: string
  messageFontSize?: string
  borderRadius?: string
  padding?: string
}

export interface ColorConfig {
  warning?: {
    border?: string
    focusBorder?: string
    text?: string
    icon?: string
  }
  error?: {
    border?: string
    focusBorder?: string
    text?: string
    icon?: string
  }
  success?: {
    border?: string
    focusBorder?: string
    text?: string
    icon?: string
  }
  default?: {
    border?: string
    focusBorder?: string
    background?: string
    text?: string
    placeholder?: string
  }
}

export interface AnimationConfig {
  enabled?: boolean
  duration?: number
  vibration?: {
    error?: number[]
    warning?: number[]
    success?: number[]
  }
  transitions?: {
    icon?: string
    message?: string
    border?: string
  }
}

export interface IconConfig {
  warning?: LucideIcon | React.ComponentType<any>
  error?: LucideIcon | React.ComponentType<any>
  success?: LucideIcon | React.ComponentType<any>
  position?: "left" | "right"
  offset?: string
}

export interface DynamicFieldProps {
  // Propriétés de base
  label?: string
  placeholder?: string
  type?: "text" | "email" | "password" | "tel" | "url" | "number" | "search"
  value?: string
  onChange?: (value: string) => void
  className?: string
  disabled?: boolean
  required?: boolean
  showLabel?: boolean
  autoComplete?: string
  autoFocus?: boolean
  
  // Configuration de validation
  validation?: ValidationConfig
  
  // Configuration de taille
  size?: SizeConfig
  
  // Configuration de couleurs
  colors?: ColorConfig
  
  // Configuration d'animations
  animations?: AnimationConfig
  
  // Configuration d'icônes
  icons?: IconConfig
  
  // Callbacks personnalisés
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
  onValidationChange?: (validation: ValidationRule | null) => void
  
  // Contenu personnalisé
  leftAddon?: React.ReactNode
  rightAddon?: React.ReactNode
  customIcon?: React.ReactNode
  
  // Styles personnalisés
  inputClassName?: string
  labelClassName?: string
  messageClassName?: string
  containerClassName?: string
}

const defaultColors: ColorConfig = {
  warning: {
    border: "border-yellow-400",
    focusBorder: "focus-within:border-yellow-500",
    text: "text-yellow-600 dark:text-yellow-400",
    icon: "text-yellow-500"
  },
  error: {
    border: "border-red-400",
    focusBorder: "focus-within:border-red-500",
    text: "text-red-600 dark:text-red-400",
    icon: "text-red-500"
  },
  success: {
    border: "border-green-400",
    focusBorder: "focus-within:border-green-500",
    text: "text-green-600 dark:text-green-400",
    icon: "text-green-500"
  },
  default: {
    border: "border-input",
    focusBorder: "focus-visible:border-ring",
    background: "bg-background",
    text: "text-foreground",
    placeholder: "placeholder:text-muted-foreground"
  }
}

const defaultSize: SizeConfig = {
  height: "h-12",
  fontSize: "text-sm",
  iconSize: "h-5 w-5",
  messageFontSize: "text-xs",
  borderRadius: "rounded-md",
  padding: "px-3 py-2"
}

const defaultAnimations: AnimationConfig = {
  enabled: true,
  duration: 300,
  vibration: {
    error: [100, 50, 100],
    warning: [50, 30, 50],
    success: [30]
  },
  transitions: {
    icon: "transition-all duration-500 ease-out",
    message: "transition-all duration-300",
    border: "transition-all duration-300"
  }
}

const defaultIcons: IconConfig = {
  warning: AlertTriangle,
  error: AlertCircle,
  success: CheckCircle,
  position: "right",
  offset: "right-3"
}

export const DynamicField: React.FC<DynamicFieldProps> = ({
  label,
  placeholder,
  type = "text",
  value = "",
  onChange,
  className,
  disabled = false,
  required = false,
  showLabel = true,
  autoComplete,
  autoFocus,
  validation = { rules: [], realTimeValidation: true, triggerVibration: true, showIcons: true, showMessages: true },
  size = {},
  colors = {},
  animations = {},
  icons = {},
  onFocus,
  onBlur,
  onValidationChange,
  leftAddon,
  rightAddon,
  customIcon,
  inputClassName,
  labelClassName,
  messageClassName,
  containerClassName,
}) => {
  const [inputValue, setInputValue] = useState(value)
  const [currentValidation, setCurrentValidation] = useState<ValidationRule | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const fieldRef = useRef<HTMLDivElement>(null)

  // Fusion des configurations avec les valeurs par défaut
  const finalSize = { ...defaultSize, ...size }
  const finalColors = {
    warning: { ...defaultColors.warning, ...colors.warning },
    error: { ...defaultColors.error, ...colors.error },
    success: { ...defaultColors.success, ...colors.success },
    default: { ...defaultColors.default, ...colors.default }
  }
  const finalAnimations = { ...defaultAnimations, ...animations }
  const finalIcons = { ...defaultIcons, ...icons }

  // Synchronisation avec la valeur externe
  useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value)
    }
  }, [value])

  // Effet de vibration
  const triggerVibration = (type: "warning" | "error" | "success") => {
    if (!validation.triggerVibration || !finalAnimations.enabled) return

    setIsAnimating(true)

    // Vibration du navigateur si supportée
    if (navigator.vibrate && finalAnimations.vibration) {
      const vibrationPattern = finalAnimations.vibration[type]
      if (vibrationPattern) {
        navigator.vibrate(vibrationPattern)
      }
    }

    // Animation CSS
    setTimeout(() => setIsAnimating(false), finalAnimations.duration || 600)
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
  }, [inputValue, validation.rules, validation.realTimeValidation, currentValidation?.type])

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

  const getIconComponent = () => {
    if (!validation.showIcons || !currentValidation) return null

    if (customIcon) return customIcon

    const IconComponent = finalIcons[currentValidation.type as keyof IconConfig] as React.ComponentType<any>
    if (!IconComponent) return null

    return (
      <IconComponent 
        className={cn(
          finalSize.iconSize,
          finalColors[currentValidation.type]?.icon
        )} 
      />
    )
  }

  const getFieldBorderColor = () => {
    if (!currentValidation) {
      return cn(
        finalColors.default?.border,
        isFocused && finalColors.default?.focusBorder
      )
    }

    const colorConfig = finalColors[currentValidation.type]
    return cn(
      colorConfig?.border,
      isFocused && colorConfig?.focusBorder
    )
  }

  const getMessageColor = () => {
    if (!currentValidation) return ""
    return finalColors[currentValidation.type]?.text || ""
  }

  const getAnimationClasses = () => {
    if (!finalAnimations.enabled || !isAnimating || !currentValidation) return ""
    
    switch (currentValidation.type) {
      case "error":
        return "animate-shake"
      case "warning":
        return "animate-bounce"
      case "success":
        return "animate-pulse"
      default:
        return ""
    }
  }

  const shouldShowIcon = validation.showIcons && (currentValidation || customIcon)
  const shouldShowMessage = validation.showMessages && currentValidation
  const iconPosition = finalIcons.position || "right"
  const hasRightContent = (iconPosition === "right" && shouldShowIcon) || rightAddon
  const hasLeftContent = (iconPosition === "left" && shouldShowIcon) || leftAddon

  return (
    <div className={cn("space-y-2", containerClassName, className)}>
      {showLabel && label && (
        <label className={cn(
          "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
          labelClassName
        )}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div
        ref={fieldRef}
        className={cn(
          "relative flex items-center",
          finalAnimations.transitions?.border,
          isAnimating && "animate-pulse"
        )}
      >
        {hasLeftContent && (
          <div className="absolute left-3 z-10 flex items-center">
            {leftAddon}
            {iconPosition === "left" && (
              <div
                className={cn(
                  finalAnimations.transitions?.icon,
                  shouldShowIcon
                    ? "opacity-100 translate-x-0 scale-100"
                    : "opacity-0 translate-x-4 scale-75 pointer-events-none",
                )}
              >
                {getIconComponent()}
              </div>
            )}
          </div>
        )}

        <input
          type={type}
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          className={cn(
            "flex w-full border ring-offset-background file:border-0 file:bg-transparent file:font-medium",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            finalSize.height,
            finalSize.fontSize,
            finalSize.borderRadius,
            finalSize.padding,
            finalColors.default?.background,
            finalColors.default?.text,
            finalColors.default?.placeholder,
            finalAnimations.transitions?.border,
            getFieldBorderColor(),
            getAnimationClasses(),
            hasLeftContent && "pl-12",
            hasRightContent && "pr-12",
            inputClassName
          )}
        />

        {hasRightContent && (
          <div className={cn("absolute z-10 flex items-center", finalIcons.offset)}>
            {iconPosition === "right" && (
              <div
                className={cn(
                  finalAnimations.transitions?.icon,
                  shouldShowIcon
                    ? "opacity-100 translate-x-0 scale-100"
                    : "opacity-0 translate-x-4 scale-75 pointer-events-none",
                )}
              >
                {getIconComponent()}
              </div>
            )}
            {rightAddon}
          </div>
        )}
      </div>

      {/* Message de validation */}
      {validation.showMessages && (
        <div
          className={cn(
            "min-h-[1.25rem]",
            finalAnimations.transitions?.message,
            shouldShowMessage ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1",
          )}
        >
          {shouldShowMessage && (
            <p className={cn(
              finalSize.messageFontSize,
              getMessageColor(),
              messageClassName
            )}>
              {currentValidation.message}
            </p>
          )}
        </div>
      )}
    </div>
  )
}