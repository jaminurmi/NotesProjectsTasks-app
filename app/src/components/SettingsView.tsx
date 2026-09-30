import { messages } from "../i18n";
import { useApp } from "../state";
import type { Language, ThemeName } from "../types";

export function SettingsView() {
  const { data, setLanguage, setTheme } = useApp();
  const text = messages[data.settings.language];

  const languages: { id: Language; label: string }[] = [
    { id: "en", label: "English" },
    { id: "fi", label: "Suomi" },
  ];
  const themes: { id: ThemeName; label: string }[] = [
    { id: "dark", label: text.dark },
    { id: "light", label: text.white },
  ];

  return (
    <section className="settings">
      <h2>{text.settings}</h2>
      <fieldset>
        <legend>{text.language}</legend>
        <div className="choice-row" role="radiogroup" aria-label={text.language}>
          {languages.map((item) => (
            <button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={data.settings.language === item.id}
              className={data.settings.language === item.id ? "active" : ""}
              onClick={() => setLanguage(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend>{text.theme}</legend>
        <div className="choice-row" role="radiogroup" aria-label={text.theme}>
          {themes.map((item) => (
            <button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={data.settings.theme === item.id}
              className={data.settings.theme === item.id ? "active" : ""}
              onClick={() => setTheme(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </fieldset>
    </section>
  );
}
