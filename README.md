### Welcome to FuelTap-supplier

FuelTap is a platform that allows suppliers and sub suppliers manage their stations , inventory and orders

### Login access configuration

Set these server-only variables in `.env.local` to the exact role values returned
by `/api/v1/auth/user`. Each accepts a comma-separated list:

```dotenv
SUPPLIER_ACCESS_ROLES=your-backend-supplier
MANAGER_ACCESS_ROLES=your-backend-manager-role
```

The supplier values above match the previous allowlist; replace the manager
placeholder with your backend's value. Restart the development server after changes.
Missing, unknown, or ambiguous roles deny access. The login selector only chooses
the authentication endpoint; verified roles determine the destination:
suppliers use `/dashboard`, and managers use `/sub`.

Manager pages live under `app/(manager)/sub/` and use a manager-only session
guard. Supplier routes retain their supplier-only guard. `/managers` remains
the supplier's manager administration page. Local mock auth continues to support
suppliers only. Backend APIs must still enforce station assignments on every
station data request.
