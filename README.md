# Eldritch Horror — Cloudflare Worker

Эта версия предназначена для уже созданного Worker `eldritch-horror`.

1. Загрузите всё содержимое этой папки в корень GitHub-репозитория.
2. Дождитесь успешной автоматической публикации.
3. В Cloudflare откройте Worker → Bindings → Add a binding → D1 database.
4. Variable name: `DB`.
5. Database: `eldritch-horror-rooms`.
6. Сохраните и при необходимости повторно опубликуйте последнюю версию.

Таблица комнат создаётся автоматически при первом запросе.
