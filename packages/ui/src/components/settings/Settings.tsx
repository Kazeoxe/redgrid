import { useState } from "react";

export interface RedditSettings {
  /** OAuth "installed app" client id from https://www.reddit.com/prefs/apps */
  clientId: string;
  /** Must match the redirect URI configured on the Reddit app. */
  redirectUri: string;
  /** Used in the required User-Agent header. */
  username: string;
}

interface SettingsProps {
  initial: RedditSettings;
  onSave: (s: RedditSettings) => void;
  onClose: () => void;
}

/**
 * Reddit-side prerequisites. The user must have created an "installed app"
 * on Reddit; this screen captures the three values that lets RedGrid talk
 * to the API. No token exchange happens here — that's a later step.
 */
export function Settings({ initial, onSave, onClose }: SettingsProps) {
  const [s, setS] = useState(initial);
  const disabled = !s.clientId.trim() || !s.redirectUri.trim() || !s.username.trim();

  return (
    <div className="rg-settings">
      <div className="rg-settings__card">
        <div className="rg-settings__header">
          <div className="rg-settings__title">Connexion Reddit</div>
          <button className="rg-settings__close" onClick={onClose} aria-label="Fermer">×</button>
        </div>
        <p className="rg-settings__intro">
          Créez une app <span className="rg-mono">installed</span> sur{" "}
          <a href="https://www.reddit.com/prefs/apps" target="_blank" rel="noreferrer">
            reddit.com/prefs/apps
          </a>{" "}
          puis reportez les valeurs ci-dessous.
        </p>

        <Field
          label="Client ID"
          hint="Sous le nom de l'app, chaîne courte alphanumérique."
          value={s.clientId}
          onChange={(v) => setS({ ...s, clientId: v })}
          placeholder="abc123XYZ..."
          mono
        />
        <Field
          label="Redirect URI"
          hint="Doit correspondre à la valeur saisie sur Reddit."
          value={s.redirectUri}
          onChange={(v) => setS({ ...s, redirectUri: v })}
          placeholder="http://localhost:5173/oauth/callback"
          mono
        />
        <Field
          label="Nom d'utilisateur Reddit"
          hint="Utilisé dans l'en-tête User-Agent requis par Reddit."
          value={s.username}
          onChange={(v) => setS({ ...s, username: v })}
          placeholder="votre_pseudo"
        />

        <button
          className="rg-settings__save"
          disabled={disabled}
          onClick={() => onSave(s)}
        >
          Enregistrer
        </button>
      </div>
    </div>
  );
}

interface FieldProps {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  mono?: boolean;
}
function Field({ label, hint, value, onChange, placeholder, mono }: FieldProps) {
  return (
    <label className="rg-settings__field">
      <span className="rg-settings__label">{label}</span>
      <input
        className={`rg-settings__input${mono ? " rg-mono" : ""}`}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        autoComplete="off"
      />
      <span className="rg-settings__hint">{hint}</span>
    </label>
  );
}
