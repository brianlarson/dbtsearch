# Deploying DBT Search (Craft) to Cloudways

## 1. Export the Craft database locally

From the **project root** (parent of `cms/`, with DDEV running):

```bash
./scripts/export-craft-db.sh
```

This writes **`cms/storage/backups/craft-export.sql`**. The script uses mysql8 or the primary db automatically.

Or run this one-liner from project root (mysql8) or from `cms/` (path as shown):

```bash
mkdir -p cms/storage/backups && ddev exec -s mysql8 mysqldump -u craft -pcraft --no-tablespaces craft > cms/storage/backups/craft-export.sql
```

After migrating to primary MySQL only, use `-s db -u db -pdb` instead of `-s mysql8 -u craft -pcraft`.

## 2. On Cloudways

- Create a **PHP application** (e.g. PHP 8.4 + MySQL 8).
- Note: **Application URL**, **SSH** user/host, **MySQL** host/user/password/database (from Cloudways panel or “Access Details”).

## 3. Upload code

- Deploy from Git (if you connect a repo), or upload the project (e.g. rsync/scp), **excluding**:
  - `node_modules/`, `.git/`, `cms/vendor/` (reinstall with Composer on server), `cms/.env` (recreate on server), `cms/storage/backups/*.sql` (optional; don’t commit backups).
- Set **document root** to `cms/web` (or the path that contains Craft’s `index.php`).
- On the server, in the app root (parent of `cms/`):  
  `cd cms && composer install --no-dev --optimize-autoloader`

## 4. Import the database

- Upload **`cms/storage/backups/craft-export.sql`** to the server (e.g. via SFTP or SCP).
- SSH in and import (use the MySQL credentials from Cloudways):

  ```bash
  mysql -h <host> -u <user> -p <database> < craft-export.sql
  ```

  Or use Cloudways’ “Database” tab and an import tool if they provide one.

## 5. Configure Craft on the server

- Create **`cms/.env`** on the server (copy from `cms/.env.example.production` or similar) and set:
  - `CRAFT_DB_DRIVER=mysql`
  - `CRAFT_DB_SERVER=` (Cloudways MySQL host, often an internal hostname or IP)
  - `CRAFT_DB_PORT=3306`
  - `CRAFT_DB_DATABASE=` (Cloudways DB name)
  - `CRAFT_DB_USER=`
  - `CRAFT_DB_PASSWORD=`
  - `CRAFT_APP_ID=` and `CRAFT_SECURITY_KEY=` (generate or copy from local; keep same for same project)
  - `PRIMARY_SITE_URL=` (e.g. `https://yourdomain.com`)
- Run:  
  `php craft project-config/apply`  
  `php craft migrate/all`  
  (and `php craft up` if you use it.)

## 6. Uploads and assets

- Sync **`cms/web/uploads/`** (and any other asset volumes) from local to the server so media and uploads exist in production.

## 7. Post-launch

- In Craft CP: **Settings → Email** for production mail (e.g. SMTP).
- **Settings → General**: set environment, turn off dev mode, set site URL.
- Point your domain at the Cloudways application and test forms, login, and asset URLs.
