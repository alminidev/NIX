import assert from "node:assert/strict";
import { before, beforeEach, describe, it, mock } from "node:test";
import { categoryFormInitialState } from "../src/types/admin-category";
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
        findUnique: async () => {
          calls.categoryReads += 1;
          return null;
        },
        update: async () => {
          calls.categoryWrites += 1;
          return { id: 1 };
        },
        create: async () => {
          calls.categoryWrites += 1;
          return { id: 1 };
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

  before(async () => {
    ({ saveProfile, changeOwnPassword } = await import(
      "../src/app/admin/profile/actions"
    ));
    ({ saveCategory } = await import("../src/app/admin/categories/actions"));
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

  it("grava o e-mail novo só depois de conferir a senha, sem mexer na foto", async () => {
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
