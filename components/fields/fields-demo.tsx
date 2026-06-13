"use client"

import React, { useState } from "react"
import { FilledField, OutlinedField, StandardField } from "./fields"
import { Mail, Lock, Phone, Globe, User, Search, Calendar, CreditCard } from "lucide-react"

export default function FieldsDemo() {
  // States pour tous les champs
  const [emailValue, setEmailValue] = useState("")
  const [passwordValue, setPasswordValue] = useState("")
  const [phoneValue, setPhoneValue] = useState("")
  const [urlValue, setUrlValue] = useState("")
  const [searchValue, setSearchValue] = useState("")
  
  // States supplémentaires pour les différentes sections
  const [email1, setEmail1] = useState("")
  const [email2, setEmail2] = useState("")
  const [email3, setEmail3] = useState("")
  const [email4, setEmail4] = useState("")
  const [email5, setEmail5] = useState("")
  const [email6, setEmail6] = useState("")
  const [email7, setEmail7] = useState("")
  const [email8, setEmail8] = useState("")
  const [password1, setPassword1] = useState("")
  const [password2, setPassword2] = useState("")
  const [password3, setPassword3] = useState("")
  const [phone1, setPhone1] = useState("")
  const [phone2, setPhone2] = useState("")
  const [phone3, setPhone3] = useState("")
  const [url1, setUrl1] = useState("")
  const [url2, setUrl2] = useState("")
  const [url3, setUrl3] = useState("")
  const [url4, setUrl4] = useState("")
  const [text1, setText1] = useState("")
  const [text2, setText2] = useState("")
  const [text3, setText3] = useState("")
  const [text4, setText4] = useState("")
  const [text5, setText5] = useState("")
  const [age, setAge] = useState("")
  const [search1, setSearch1] = useState("")
  const [search2, setSearch2] = useState("")
  
  // States pour section icônes gauche
  const [emailLeftFilled, setEmailLeftFilled] = useState("")
  const [passwordLeftOutlined, setPasswordLeftOutlined] = useState("")
  const [phoneLeftStandard, setPhoneLeftStandard] = useState("")
  const [urlLeftFilled, setUrlLeftFilled] = useState("")
  const [userLeft, setUserLeft] = useState("")
  const [searchLeft, setSearchLeft] = useState("")
  
  // States pour section icônes label
  const [emailLabelFilled, setEmailLabelFilled] = useState("")
  const [passwordLabelOutlined, setPasswordLabelOutlined] = useState("")
  const [phoneLabelStandard, setPhoneLabelStandard] = useState("")
  const [dateLabelFilled, setDateLabelFilled] = useState("")
  const [cardLabelOutlined, setCardLabelOutlined] = useState("")
  const [urlLabelStandard, setUrlLabelStandard] = useState("")
  
  // States pour section animation
  const [emailAnim, setEmailAnim] = useState("")
  const [passwordAnim, setPasswordAnim] = useState("")
  const [phoneAnim, setPhoneAnim] = useState("")
  const [urlAnim, setUrlAnim] = useState("")
  
  // States pour section états validation
  const [emailSuccess, setEmailSuccess] = useState("user@example.com")
  const [emailError, setEmailError] = useState("emailinvalide")
  const [passwordWarning, setPasswordWarning] = useState("Password123")

  // Règles de validation pour email
  const emailValidation = {
    rules: [
      {
        regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: "Veuillez entrer une adresse email valide",
        type: "error" as const,
      },
      {
        regex: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        message: "Format d'email parfait!",
        type: "success" as const,
      },
    ],
    realTimeValidation: true,
    triggerVibration: true,
    showIcons: true,
    showMessages: true,
  }

  // Règles de validation pour mot de passe
  const passwordValidation = {
    rules: [
      {
        regex: /.{8,}/,
        message: "Le mot de passe doit contenir au moins 8 caractères",
        type: "error" as const,
      },
      {
        regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        message: "Mot de passe fort! Excellent choix de sécurité.",
        type: "success" as const,
      },
      {
        regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
        message: "Ajoutez un caractère spécial pour renforcer la sécurité",
        type: "warning" as const,
      },
    ],
    realTimeValidation: true,
    triggerVibration: true,
    showIcons: true,
    showMessages: true,
  }

  // Règles de validation pour téléphone
  const phoneValidation = {
    rules: [
      {
        regex: /^[\d\s\-\+\(\)]{10,}$/,
        message: "Numéro de téléphone invalide",
        type: "error" as const,
      },
      {
        regex: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
        message: "Format de téléphone valide!",
        type: "success" as const,
      },
    ],
    realTimeValidation: true,
    triggerVibration: true,
    showIcons: true,
    showMessages: true,
  }

  // Règles de validation pour URL
  const urlValidation = {
    rules: [
      {
        regex: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
        message: "Veuillez entrer une URL valide",
        type: "error" as const,
      },
      {
        regex: /^https:\/\/([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
        message: "URL sécurisée (HTTPS)!",
        type: "success" as const,
      },
      {
        regex: /^http:\/\/([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
        message: "Considérez l'utilisation de HTTPS pour plus de sécurité",
        type: "warning" as const,
      },
    ],
    realTimeValidation: true,
    triggerVibration: true,
    showIcons: true,
    showMessages: true,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Démonstration des Champs Dynamiques
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Explorez toutes les variations et configurations possibles
          </p>
        </div>

        {/* Section 1: FilledField */}
        <section className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              1. FilledField (Champs Remplis)
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Basique */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  Basique (Sans validation)
                </h3>
                <FilledField
                  label="Nom complet"
                  placeholder="Entrez votre nom"
                  type="text"
                />
              </div>

              {/* Avec validation email */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  Avec validation Email
                </h3>
                <FilledField
                  label="Adresse Email"
                  placeholder="exemple@email.com"
                  type="email"
                  value={email1}
                  onChange={setEmail1}
                  validation={emailValidation}
                  required
                />
              </div>

              {/* Avec validation mot de passe */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  Avec validation Mot de passe
                </h3>
                <FilledField
                  label="Mot de passe"
                  placeholder="Entrez votre mot de passe"
                  type="password"
                  value={password1}
                  onChange={setPassword1}
                  validation={passwordValidation}
                  required
                />
              </div>

              {/* Désactivé */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  Champ désactivé
                </h3>
                <FilledField
                  label="Champ désactivé"
                  placeholder="Non modifiable"
                  type="text"
                  value="Valeur par défaut"
                  disabled
                />
              </div>

              {/* Sans icônes */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  Sans icônes de validation
                </h3>
                <FilledField
                  label="Email sans icône"
                  placeholder="exemple@email.com"
                  type="email"
                  value={email2}
                  onChange={setEmail2}
                  validation={{
                    ...emailValidation,
                    showIcons: false,
                  }}
                />
              </div>

              {/* Sans messages */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  Sans messages de validation
                </h3>
                <FilledField
                  label="Email sans message"
                  placeholder="exemple@email.com"
                  type="email"
                  value={email3}
                  onChange={setEmail3}
                  validation={{
                    ...emailValidation,
                    showMessages: false,
                  }}
                />
              </div>

              {/* Validation désactivée */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  Validation temps réel désactivée
                </h3>
                <FilledField
                  label="Email (validation au blur)"
                  placeholder="exemple@email.com"
                  type="email"
                  value={email4}
                  onChange={setEmail4}
                  validation={{
                    ...emailValidation,
                    realTimeValidation: false,
                  }}
                />
              </div>

              {/* Sans vibration */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  Sans vibration
                </h3>
                <FilledField
                  label="Email sans vibration"
                  placeholder="exemple@email.com"
                  type="email"
                  value={email5}
                  onChange={setEmail5}
                  validation={{
                    ...emailValidation,
                    triggerVibration: false,
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: OutlinedField */}
        <section className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              2. OutlinedField (Champs avec contour)
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Basique */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  Basique (Sans validation)
                </h3>
                <OutlinedField
                  label="Nom complet"
                  placeholder="Entrez votre nom"
                  type="text"
                />
              </div>

              {/* Avec validation téléphone */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  Avec validation Téléphone
                </h3>
                <OutlinedField
                  label="Numéro de téléphone"
                  placeholder="+33 6 12 34 56 78"
                  type="tel"
                  value={phone1}
                  onChange={setPhone1}
                  validation={phoneValidation}
                  required
                />
              </div>

              {/* Avec validation URL */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  Avec validation URL
                </h3>
                <OutlinedField
                  label="Site Web"
                  placeholder="https://exemple.com"
                  type="url"
                  value={url1}
                  onChange={setUrl1}
                  validation={urlValidation}
                />
              </div>

              {/* Désactivé */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  Champ désactivé
                </h3>
                <OutlinedField
                  label="Champ désactivé"
                  placeholder="Non modifiable"
                  type="text"
                  value="Valeur par défaut"
                  disabled
                />
              </div>

              {/* Type number */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  Type number
                </h3>
                <OutlinedField
                  label="Âge"
                  placeholder="18"
                  type="number"
                  value={age}
                  onChange={setAge}
                  validation={{
                    rules: [
                      {
                        regex: /^[1-9]\d*$/,
                        message: "Veuillez entrer un âge valide",
                        type: "error",
                      },
                      {
                        regex: /^(1[8-9]|[2-9]\d|\d{3,})$/,
                        message: "Âge valide (18+)",
                        type: "success",
                      },
                    ],
                    realTimeValidation: true,
                    triggerVibration: true,
                    showIcons: true,
                    showMessages: true,
                  }}
                />
              </div>

              {/* Type search */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  Type search
                </h3>
                <OutlinedField
                  label="Rechercher"
                  placeholder="Rechercher quelque chose..."
                  type="search"
                  value={search1}
                  onChange={setSearch1}
                />
              </div>

              {/* Configuration minimale */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  Configuration minimale
                </h3>
                <OutlinedField
                  label="Email minimal"
                  type="email"
                  value={email6}
                  onChange={setEmail6}
                  validation={{
                    rules: emailValidation.rules,
                    showIcons: false,
                    showMessages: false,
                  }}
                />
              </div>

              {/* AutoFocus */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  Avec AutoFocus
                </h3>
                <OutlinedField
                  label="Champ auto-focus"
                  placeholder="Ce champ a le focus automatiquement"
                  type="text"
                  autoFocus
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: StandardField */}
        <section className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              3. StandardField (Champs standard)
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Basique */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  Basique (Sans validation)
                </h3>
                <StandardField
                  label="Nom complet"
                  placeholder="Entrez votre nom"
                  type="text"
                />
              </div>

              {/* Avec toutes les validations */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  Email avec validation complète
                </h3>
                <StandardField
                  label="Adresse Email"
                  placeholder="exemple@email.com"
                  type="email"
                  value={email7}
                  onChange={setEmail7}
                  validation={emailValidation}
                  required
                />
              </div>

              {/* Mot de passe */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  Mot de passe
                </h3>
                <StandardField
                  label="Mot de passe"
                  placeholder="Entrez votre mot de passe"
                  type="password"
                  value={password2}
                  onChange={setPassword2}
                  validation={passwordValidation}
                  required
                />
              </div>

              {/* Désactivé */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  Champ désactivé
                </h3>
                <StandardField
                  label="Champ désactivé"
                  placeholder="Non modifiable"
                  type="text"
                  value="Valeur par défaut"
                  disabled
                />
              </div>

              {/* Téléphone */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  Téléphone
                </h3>
                <StandardField
                  label="Numéro de téléphone"
                  placeholder="+33 6 12 34 56 78"
                  type="tel"
                  value={phone2}
                  onChange={setPhone2}
                  validation={phoneValidation}
                />
              </div>

              {/* URL */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  URL
                </h3>
                <StandardField
                  label="Site Web"
                  placeholder="https://exemple.com"
                  type="url"
                  value={url2}
                  onChange={setUrl2}
                  validation={urlValidation}
                />
              </div>

              {/* Sans icône mais avec messages */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  Messages seuls (sans icônes)
                </h3>
                <StandardField
                  label="Email"
                  placeholder="exemple@email.com"
                  type="email"
                  value={email8}
                  onChange={setEmail8}
                  validation={{
                    ...emailValidation,
                    showIcons: false,
                  }}
                />
              </div>

              {/* Icônes seules (sans messages) */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  Icônes seules (sans messages)
                </h3>
                <StandardField
                  label="Email"
                  placeholder="exemple@email.com"
                  type="email"
                  value={text1}
                  onChange={setText1}
                  validation={{
                    ...emailValidation,
                    showMessages: false,
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Comparaison côte à côte */}
        <section className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              4. Comparaison des trois types
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-center text-gray-700 dark:text-gray-300">
                  FilledField
                </h3>
                <FilledField
                  label="Email"
                  placeholder="exemple@email.com"
                  type="email"
                  value={text2}
                  onChange={setText2}
                  validation={emailValidation}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-center text-gray-700 dark:text-gray-300">
                  OutlinedField
                </h3>
                <OutlinedField
                  label="Email"
                  placeholder="exemple@email.com"
                  type="email"
                  value={text3}
                  onChange={setText3}
                  validation={emailValidation}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-center text-gray-700 dark:text-gray-300">
                  StandardField
                </h3>
                <StandardField
                  label="Email"
                  placeholder="exemple@email.com"
                  type="email"
                  value={text4}
                  onChange={setText4}
                  validation={emailValidation}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Icônes de champ - Position Gauche */}
        <section className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              5. Icônes de champ - Position Gauche
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* FilledField avec icône gauche */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  FilledField avec icône Mail à gauche
                </h3>
                <FilledField
                  label="Email"
                  placeholder="exemple@email.com"
                  type="email"
                  value={emailLeftFilled}
                  onChange={setEmailLeftFilled}
                  fieldIcon={{ icon: Mail, position: "left" }}
                  validation={emailValidation}
                />
              </div>

              {/* OutlinedField avec icône gauche */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  OutlinedField avec icône Lock à gauche
                </h3>
                <OutlinedField
                  label="Mot de passe"
                  placeholder="Entrez votre mot de passe"
                  type="password"
                  value={passwordLeftOutlined}
                  onChange={setPasswordLeftOutlined}
                  fieldIcon={{ icon: Lock, position: "left" }}
                  validation={passwordValidation}
                />
              </div>

              {/* StandardField avec icône gauche */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  StandardField avec icône Phone à gauche
                </h3>
                <StandardField
                  label="Téléphone"
                  placeholder="+33 6 12 34 56 78"
                  type="tel"
                  value={phoneLeftStandard}
                  onChange={setPhoneLeftStandard}
                  fieldIcon={{ icon: Phone, position: "left" }}
                  validation={phoneValidation}
                />
              </div>

              {/* Autre exemple */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  FilledField avec icône Globe à gauche
                </h3>
                <FilledField
                  label="Site Web"
                  placeholder="https://exemple.com"
                  type="url"
                  value={urlLeftFilled}
                  onChange={setUrlLeftFilled}
                  fieldIcon={{ icon: Globe, position: "left" }}
                  validation={urlValidation}
                />
              </div>

              {/* User icon */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  OutlinedField avec icône User à gauche
                </h3>
                <OutlinedField
                  label="Nom d'utilisateur"
                  placeholder="Entrez votre nom"
                  type="text"
                  value={userLeft}
                  onChange={setUserLeft}
                  fieldIcon={{ icon: User, position: "left" }}
                />
              </div>

              {/* Search icon */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  StandardField avec icône Search à gauche
                </h3>
                <StandardField
                  label="Rechercher"
                  placeholder="Rechercher quelque chose..."
                  type="search"
                  value={searchLeft}
                  onChange={setSearchLeft}
                  fieldIcon={{ icon: Search, position: "left" }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section 6: Icônes de champ - Position Label */}
        <section className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              6. Icônes de champ - Position Label
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* FilledField avec icône dans label */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  FilledField avec icône Mail dans le label
                </h3>
                <FilledField
                  label="Email"
                  placeholder="exemple@email.com"
                  type="email"
                  value={emailLabelFilled}
                  onChange={setEmailLabelFilled}
                  fieldIcon={{ icon: Mail, position: "label" }}
                  validation={emailValidation}
                />
              </div>

              {/* OutlinedField avec icône dans label */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  OutlinedField avec icône Lock dans le label
                </h3>
                <OutlinedField
                  label="Mot de passe"
                  placeholder="Entrez votre mot de passe"
                  type="password"
                  value={passwordLabelOutlined}
                  onChange={setPasswordLabelOutlined}
                  fieldIcon={{ icon: Lock, position: "label" }}
                  validation={passwordValidation}
                />
              </div>

              {/* StandardField avec icône dans label */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  StandardField avec icône Phone dans le label
                </h3>
                <StandardField
                  label="Téléphone"
                  placeholder="+33 6 12 34 56 78"
                  type="tel"
                  value={phoneLabelStandard}
                  onChange={setPhoneLabelStandard}
                  fieldIcon={{ icon: Phone, position: "label" }}
                  validation={phoneValidation}
                />
              </div>

              {/* Calendar icon */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  FilledField avec icône Calendar dans le label
                </h3>
                <FilledField
                  label="Date de naissance"
                  placeholder="JJ/MM/AAAA"
                  type="text"
                  value={dateLabelFilled}
                  onChange={setDateLabelFilled}
                  fieldIcon={{ icon: Calendar, position: "label" }}
                />
              </div>

              {/* CreditCard icon */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  OutlinedField avec icône CreditCard dans le label
                </h3>
                <OutlinedField
                  label="Numéro de carte"
                  placeholder="0000 0000 0000 0000"
                  type="text"
                  value={cardLabelOutlined}
                  onChange={setCardLabelOutlined}
                  fieldIcon={{ icon: CreditCard, position: "label" }}
                />
              </div>

              {/* Globe icon */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  StandardField avec icône Globe dans le label
                </h3>
                <StandardField
                  label="Site Web"
                  placeholder="https://exemple.com"
                  type="url"
                  value={urlLabelStandard}
                  onChange={setUrlLabelStandard}
                  fieldIcon={{ icon: Globe, position: "label" }}
                  validation={urlValidation}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section 7: Animation de validation en action */}
        <section className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              7. Animation de validation en action
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Tapez dans les champs ci-dessous pour voir l'animation slide des icônes d'état depuis la droite, 
              ainsi que la transition de couleur synchronisée du label, du texte et du message de validation.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Email avec animation */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  Email - Observez l'animation slide
                </h3>
                <FilledField
                  label="Adresse Email"
                  placeholder="Tapez pour voir l'animation..."
                  type="email"
                  value={emailAnim}
                  onChange={setEmailAnim}
                  fieldIcon={{ icon: Mail, position: "left" }}
                  validation={emailValidation}
                />
              </div>

              {/* Password avec animation */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  Mot de passe - Transitions de couleurs
                </h3>
                <OutlinedField
                  label="Mot de passe"
                  placeholder="Tapez pour voir l'animation..."
                  type="password"
                  value={passwordAnim}
                  onChange={setPasswordAnim}
                  fieldIcon={{ icon: Lock, position: "label" }}
                  validation={passwordValidation}
                />
              </div>

              {/* Phone avec animation */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  Téléphone - Animation complète
                </h3>
                <StandardField
                  label="Numéro de téléphone"
                  placeholder="Tapez pour voir l'animation..."
                  type="tel"
                  value={phoneAnim}
                  onChange={setPhoneAnim}
                  fieldIcon={{ icon: Phone, position: "left" }}
                  validation={phoneValidation}
                />
              </div>

              {/* URL avec animation */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  URL - États multiples
                </h3>
                <FilledField
                  label="Site Web"
                  placeholder="Tapez pour voir l'animation..."
                  type="url"
                  value={urlAnim}
                  onChange={setUrlAnim}
                  fieldIcon={{ icon: Globe, position: "label" }}
                  validation={urlValidation}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section 8: États de validation */}
        <section className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              8. États de validation visuels
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* État Success */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-center text-green-600 dark:text-green-400">
                  État Success ✓
                </h3>
                <OutlinedField
                  label="Email valide"
                  type="email"
                  value={emailSuccess}
                  onChange={setEmailSuccess}
                  fieldIcon={{ icon: Mail, position: "left" }}
                  validation={emailValidation}
                />
              </div>

              {/* État Error */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-center text-red-600 dark:text-red-400">
                  État Error ✗
                </h3>
                <OutlinedField
                  label="Email invalide"
                  type="email"
                  value={emailError}
                  onChange={setEmailError}
                  fieldIcon={{ icon: Mail, position: "left" }}
                  validation={emailValidation}
                />
              </div>

              {/* État Warning */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-center text-blue-600 dark:text-blue-400">
                  État Warning ⚠
                </h3>
                <OutlinedField
                  label="Mot de passe"
                  type="password"
                  value={passwordWarning}
                  onChange={setPasswordWarning}
                  fieldIcon={{ icon: Lock, position: "left" }}
                  validation={passwordValidation}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Footer avec informations */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-lg p-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            📝 Fonctionnalités des champs dynamiques
          </h3>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300">
            <li>✓ Validation en temps réel personnalisable</li>
            <li>✓ Support de multiples règles de validation (error, warning, success)</li>
            <li>✓ Feedback visuel avec icônes et messages</li>
            <li>✓ Animation slide des icônes d'état depuis la droite</li>
            <li>✓ Transition de couleur synchronisée (label, texte, message)</li>
            <li>✓ Icônes de champ positionnables (gauche ou label)</li>
            <li>✓ Animation et vibration du navigateur</li>
            <li>✓ Support de tous les types d'input HTML5</li>
            <li>✓ Mode sombre automatique</li>
            <li>✓ États désactivés et requis</li>
            <li>✓ AutoFocus et AutoComplete</li>
            <li>✓ Callbacks personnalisables (onChange, onFocus, onBlur, onValidationChange)</li>
            <li>✓ Configuration granulaire (afficher/masquer icônes, messages, vibrations)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}