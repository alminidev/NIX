import assert from "node:assert/strict";
import { before, beforeEach, describe, it, mock } from "node:test";
import { categoryFormInitialState } from "../src/types/admin-category";
import { settingsFormInitialState } from "../src/types/admin-settings";
import {
  passwordFormInitialState,
  profileFormInitialState,
} from "../src/types/admin-profile";

process.env.DATABASE_URL ??=
  "postgresql://postgres:postgres@127.0.0.1:54322/postgres?sslmode=disable";

interface ISessionUser {
  id: string;
  role: string;
  email: string;
  name: string;
}

let session: { user: ISessionUser } | null = null;
let passwordAccepted = true;

const calls = {
  updateBodies: [] as Array<Record<string, unknown>>,
  verified: 0,
  revokeOtherSessions: [] as boolean[],
  userReads: 0,
  userWrites: [] as Array<{
    where: { id: string };
    data: Record<string, unknown>;
  }>,
  categoryReads: 0,
  categoryWrites: 0,
  categoryUpdates: [] as Array<{
    where: { id: number };
    data: { name: string; slug: string; sortOrder: number };
  }>,
  settingsWrites: [] as string[],
  shippingProviderWrites: [] as string[],
};

function resetCalls() {
  session = null;
  passwordAccepted = true;
  calls.updateBodies.length = 0;
  calls.verified = 0;
  calls.revokeOtherSessions.length = 0;
  calls.userReads = 0;
  calls.userWrites.length = 0;
  calls.categoryReads = 0;
  calls.categoryWrites = 0;
  calls.categoryUpdates.length = 0;
  calls.settingsWrites.length = 0;
  calls.shippingProviderWrites.length = 0;
}

mock.module("next/navigation", {
  namedExports: {
    redirect(url: string) {
      throw new Error(`redirect:${url}`);
    },
  },
});

mock.module("next/cache", {
  namedExports: {
    updateTag() {},
  },
});

mock.module("next/headers", {
  namedExports: {
    headers: async () => new Headers(),
  },
});

mock.module("@/lib/session", {
  namedExports: {
    getSession: async () => session,
  },
});

mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      user: {
        findUnique: async () => {
          calls.userReads += 1;
          return null;
        },
        update: async (args: {
          where: { id: string };
          data: Record<string, unknown>;
        }) => {
          calls.userWrites.push({ where: args.where, data: args.data });
          return { id: args.where.id };
        },
      },
      category: {
        findUnique: async (args: { where: { id?: number; slug?: string } }) => {
          calls.categoryReads += 1;
          if (typeof args.where.id === "number") {
            return { id: args.where.id, slug: "armarios" };
          }
          return null;
        },
        update: async (args: {
          where: { id: number };
          data: { name: string; slug: string; sortOrder: number };
        }) => {
          calls.categoryWrites += 1;
          calls.categoryUpdates.push({ where: args.where, data: args.data });
          return { id: args.where.id };
        },
        create: async () => {
          calls.categoryWrites += 1;
          return { id: 1 };
        },
      },
      shopSettings: {
        upsert: async (args: {
          create: {
            productionTimeTemplate?: string;
            shippingProvider?: string;
          };
          update: {
            productionTimeTemplate?: string;
            shippingProvider?: string;
          };
        }) => {
          const template =
            args.update.productionTimeTemplate ??
            args.create.productionTimeTemplate;
          const provider =
            args.update.shippingProvider ?? args.create.shippingProvider;
          if (typeof template === "string") calls.settingsWrites.push(template);
          if (typeof provider === "string") {
            calls.shippingProviderWrites.push(provider);
          }
          return { id: 1, productionTimeTemplate: template, shippingProvider: provider };
        },
      },
    },
  },
});

mock.module("@/lib/auth", {
  namedExports: {
    auth: {
      api: {
        updateUser: async (args: { body: Record<string, unknown> }) => {
          calls.updateBodies.push({ ...args.body });
          return { status: true };
        },
        verifyPassword: async () => {
          calls.verified += 1;
          if (!passwordAccepted) {
            throw { body: { code: "INVALID_PASSWORD" } };
          }
          return { status: true };
        },
        changePassword: async (args: {
          body: { revokeOtherSessions?: boolean };
        }) => {
          calls.revokeOtherSessions.push(args.body.revokeOtherSessions === true);
          return { token: "nova-sessao", user: { id: "admin-1" } };
        },
      },
    },
  },
});

function adminSession(): { user: ISessionUser } {
  return {
    user: {
      id: "admin-1",
      role: "admin",
      email: "admin@admin.com",
      name: "Administrador",
    },
  };
}

function profileBody(overrides: Record<string, string> = {}) {
  const data = new FormData();
  const values: Record<string, string> = {
    name: "Novo Nome",
    email: "admin@admin.com",
    ...overrides,
  };
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

function passwordBody() {
  const data = new FormData();
  data.set("currentPassword", "senha-atual");
  data.set("newPassword", "senha-nova-1");
  data.set("confirmPassword", "senha-nova-1");
  return data;
}

function settingsBody(template = "Prazo de produção: {dias}.") {
  const data = new FormData();
  data.set("productionTimeTemplate", template);
  return data;
}

function categoryBody() {
  const data = new FormData();
  data.set("name", "Armários Dry Box");
  data.set("slug", "armarios");
  data.set("sortOrder", "1");
  return data;
}

async function expectRedirect(run: () => Promise<unknown>, url: string) {
  await assert.rejects(run, (error: unknown) => {
    assert.ok(error instanceof Error);
    assert.equal(error.message, `redirect:${url}`);
    return true;
  });
}

describe("actions do admin sem sessão", () => {
  let saveProfile: typeof import("../src/app/admin/profile/actions").saveProfile;
  let changeOwnPassword: typeof import("../src/app/admin/profile/actions").changeOwnPassword;
  let saveCategory: typeof import("../src/app/admin/categories/actions").saveCategory;
  let saveShopSettings: typeof import("../src/app/admin/settings/actions").saveShopSettings;
  let saveShippingProvider: typeof import("../src/app/admin/settings/actions").saveShippingProvider;

  before(async () => {
    ({ saveProfile, changeOwnPassword } = await import(
      "../src/app/admin/profile/actions"
    ));
    ({ saveCategory } = await import("../src/app/admin/categories/actions"));
    ({ saveShopSettings, saveShippingProvider } = await import(
      "../src/app/admin/settings/actions"
    ));
  });

  beforeEach(() => {
    resetCalls();
  });

  it("recusa salvar o perfil e trocar a senha sem sessão", async () => {
    session = null;

    const profile = await saveProfile(profileFormInitialState, profileBody());
    const password = await changeOwnPassword(
      passwordFormInitialState,
      passwordBody(),
    );

    assert.equal(profile.status, "error");
    assert.equal(profile.message, "Acesso negado.");
    assert.equal(password.status, "error");
    assert.equal(password.message, "Acesso negado.");
    assert.equal(calls.verified, 0);
    assert.equal(calls.updateBodies.length, 0);
    assert.equal(calls.userReads, 0);
    assert.equal(calls.userWrites.length, 0);
  });

  it("recusa salvar categoria sem sessão e para quem não é admin", async () => {
    session = null;
    const anonymous = await saveCategory(categoryFormInitialState, categoryBody());

    session = {
      user: {
        id: "cliente-1",
        role: "cliente",
        email: "cliente@exemplo.com",
        name: "Cliente",
      },
    };
    const customer = await saveCategory(categoryFormInitialState, categoryBody());

    assert.equal(anonymous.status, "error");
    assert.equal(anonymous.message, "Acesso negado.");
    assert.equal(customer.status, "error");
    assert.equal(customer.message, "Acesso negado.");
    assert.equal(calls.categoryReads, 0);
    assert.equal(calls.categoryWrites, 0);
  });

  it("grava o modelo global só para admin e recusa quem não é", async () => {
    session = null;
    const anonymous = await saveShopSettings(
      settingsFormInitialState,
      settingsBody(),
    );

    session = {
      user: {
        id: "cliente-1",
        role: "cliente",
        email: "cliente@exemplo.com",
        name: "Cliente",
      },
    };
    const customer = await saveShopSettings(
      settingsFormInitialState,
      settingsBody(),
    );

    assert.equal(anonymous.status, "error");
    assert.equal(anonymous.message, "Acesso negado.");
    assert.equal(customer.status, "error");
    assert.equal(customer.message, "Acesso negado.");
    assert.deepEqual(calls.settingsWrites, []);

    session = adminSession();
    const invalid = await saveShopSettings(
      settingsFormInitialState,
      settingsBody("Sem o prazo."),
    );
    assert.equal(invalid.status, "error");
    assert.match(invalid.fieldErrors.productionTimeTemplate ?? "", /\{dias\}/);
    assert.deepEqual(calls.settingsWrites, []);

    await expectRedirect(
      () =>
        saveShopSettings(
          settingsFormInitialState,
          settingsBody("Prazo de produção: {dias}."),
        ),
      "/admin/settings?notice=saved",
    );
    assert.deepEqual(calls.settingsWrites, ["Prazo de produção: {dias}."]);
    assert.deepEqual(calls.shippingProviderWrites, []);
  });

  it("grava o provedor de frete só para admin", async () => {
    function providerBody(provider: string) {
      const data = new FormData();
      data.set("shippingProvider", provider);
      return data;
    }

    session = null;
    const anonymous = await saveShippingProvider(
      settingsFormInitialState,
      providerBody("central_do_frete"),
    );

    session = {
      user: {
        id: "cliente-1",
        role: "cliente",
        email: "cliente@exemplo.com",
        name: "Cliente",
      },
    };
    const customer = await saveShippingProvider(
      settingsFormInitialState,
      providerBody("central_do_frete"),
    );

    assert.equal(anonymous.status, "error");
    assert.equal(anonymous.message, "Acesso negado.");
    assert.equal(customer.status, "error");
    assert.equal(customer.message, "Acesso negado.");
    assert.deepEqual(calls.shippingProviderWrites, []);

    session = adminSession();
    const invalid = await saveShippingProvider(
      settingsFormInitialState,
      providerBody("outro"),
    );
    assert.equal(invalid.status, "error");
    assert.match(
      invalid.fieldErrors.shippingProvider ?? "",
      /Melhor Envio ou Central do Frete/,
    );
    assert.deepEqual(calls.shippingProviderWrites, []);

    await expectRedirect(
      () =>
        saveShippingProvider(
          settingsFormInitialState,
          providerBody("central_do_frete"),
        ),
      "/admin/settings?notice=saved",
    );
    assert.deepEqual(calls.shippingProviderWrites, ["central_do_frete"]);
    assert.deepEqual(calls.settingsWrites, []);
  });

  it("mantém o identificador original ao editar com outro slug no formulário", async () => {
    session = adminSession();
    const body = categoryBody();
    body.set("id", "2");
    body.set("slug", "stations");
    body.set("name", "Nome novo");
    body.set("sortOrder", "4");

    await expectRedirect(
      () => saveCategory(categoryFormInitialState, body),
      "/admin/categories?notice=updated",
    );

    assert.equal(calls.categoryWrites, 1);
    assert.deepEqual(calls.categoryUpdates, [
      {
        where: { id: 2 },
        data: { name: "Nome novo", slug: "armarios", sortOrder: 4 },
      },
    ]);
  });

  it("salva o nome sem enviar image e sem pedir senha", async () => {
    session = adminSession();
    const body = profileBody();
    body.set("image", "/images/logo-nix.png");

    await expectRedirect(
      () => saveProfile(profileFormInitialState, body),
      "/admin/profile?notice=profile",
    );

    assert.equal(calls.verified, 0);
    assert.deepEqual(calls.updateBodies, [{ name: "Novo Nome" }]);
    assert.equal(calls.updateBodies.some((update) => "image" in update), false);
    assert.equal(calls.userReads, 0);
    assert.equal(calls.userWrites.length, 0);
  });

  it("não grava e-mail novo quando a senha atual está incorreta", async () => {
    session = adminSession();
    passwordAccepted = false;
    const secret = "senha-errada";
    const result = await saveProfile(
      profileFormInitialState,
      profileBody({ email: "novo@exemplo.com", currentPassword: secret }),
    );

    assert.equal(result.status, "error");
    assert.equal(result.message, "Revise os campos destacados.");
    assert.equal(
      result.fieldErrors.currentPassword,
      "A senha atual está incorreta.",
    );
    assert.equal(JSON.stringify(result).includes(secret), false);
    assert.equal(calls.verified, 1);
    assert.equal(calls.updateBodies.length, 0);
    assert.equal(calls.userReads, 0);
    assert.equal(calls.userWrites.length, 0);
  });

  it("grava o e-mail novo só depois de conferir a senha, sem mexer na imagem", async () => {
    session = adminSession();
    const body = profileBody({
      email: "novo@exemplo.com",
      currentPassword: "senha-certa",
    });
    body.set("image", "/images/logo-nix.png");

    await expectRedirect(
      () => saveProfile(profileFormInitialState, body),
      "/admin/profile?notice=profile",
    );

    assert.equal(calls.verified, 1);
    assert.deepEqual(calls.updateBodies, [{ name: "Novo Nome" }]);
    assert.equal(calls.userReads, 1);
    assert.deepEqual(calls.userWrites, [
      {
        where: { id: "admin-1" },
        data: { email: "novo@exemplo.com" },
      },
    ]);
    assert.equal(
      calls.userWrites.some((write) => "image" in write.data),
      false,
    );
  });

  it("derruba as outras sessões ao trocar a senha", async () => {
    session = adminSession();

    await expectRedirect(
      () => changeOwnPassword(passwordFormInitialState, passwordBody()),
      "/admin/profile?notice=password",
    );

    assert.deepEqual(calls.revokeOtherSessions, [true]);
  });
});
