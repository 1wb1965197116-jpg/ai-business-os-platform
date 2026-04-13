let apps = [];

export function createApp(req, res) {
  const { name, description, price, owner } = req.body;

  const app = {
    id: Date.now(),
    name,
    description,
    price,
    owner
  };

  apps.push(app);

  res.json(app);
}

export function getApps(req, res) {
  res.json(apps);
}
