# UI Библиотека

`./base` - базовые компоненты
`./layout` - компоненты для разметки страницы
`./blocks` - блоки для страницы
`./styles` - стили CSS для компонентов

## Кнопка

`./base/button` - базовые кнопки

Пример

<div class="buttons">
  <button paperButton size="xs">Я кнопка xs</button>
  <button paperButton size="s">Я кнопка s</button>
  <button paperButton size="m">Я кнопка m</button>
  <button paperButton size="l">Я кнопка l</button>
  <button paperButton size="xl">Я кнопка xl</button>
</div>

## Инпут

Для инпута потребуются:

`./base/input` - базовые инпуты
`./base/textfield` - базовые текстовые поля
`./base/label` - базовые лейблы

Пример

<div class="vitrine">
  <paper-textfield size="s">
    <label paperLabel>Введите текст</label>
    <input paperInput>
  </paper-textfield>

  <paper-textfield size="m">
    <label paperLabel>Введите текст</label>
    <input paperInput>
  </paper-textfield>

  <paper-textfield size="l">
    <label paperLabel>Введите текст</label>
    <input paperInput>
  </paper-textfield>
</div>

## Инпут с выбором ответа

Для инпута с выбором ответа потребуются:

`./base/data-list` - Лист с выбором ответа
`./base/input` - базовые инпуты
`./base/textfield` - базовые текстовые поля
`./base/label` - базовые лейблы

Пример

<form [formGroup]="form" class="form">
  <paper-textfield size="s"#textfield >
    <paper-data-list [variants]="variants" formControlName="searchS">
      <label paperLabel>Введите текст</label>
      <input paperInput name="searchS" #inputList>
    </paper-data-list>
  </paper-textfield>

  <paper-textfield size="m"#textfield >
    <paper-data-list [variants]="variants" formControlName="searchM">
      <label paperLabel>Введите текст</label>
      <input paperInput name="searchM" #inputList>
    </paper-data-list>
  </paper-textfield>

  <paper-textfield size="l"#textfield >
    <paper-data-list [variants]="variants" formControlName="searchL">
      <label paperLabel>Введите текст</label>
      <input paperInput name="searchL" #inputList>
    </paper-data-list>

  </paper-textfield>

  <paper-textfield size="m"#textfield >
    <paper-data-list [variants]="students" formControlName="student" [labelResolver]="studentResolver">
      <label paperLabel>Поиск студента</label>
      <input paperInput name="student" #inputList>
    </paper-data-list>
  </paper-textfield>
</form>