# Eldritch Horror: общая комната

Готовый проект для Cloudflare Pages. Сборка и npm не требуются.

При создании Pages-проекта:

- Framework preset: `None`
- Build command: `exit 0`
- Build output directory: `.`

После первой публикации создайте D1 database и добавьте её в Pages project как D1 binding с именем `DB`. Затем запустите повторную публикацию.

Таблица `rooms` создаётся автоматически при первом запросе. Файл `schema.sql` приложен как резервный вариант для ручного создания.
