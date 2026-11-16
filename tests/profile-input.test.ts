import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isProfileImage,
  readPasswordForm,
  readProfileForm,
} from "../src/lib/profile-input";

function profileForm(overrides: Record<string, string> = {}) {
  const data = new FormData();
  const values: Record<string, string> = {
    name: "Administrador",
    email: "Admin@Admin.com",
    image: "",
    ...overrides,
  };

  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

function passwordForm(overrides: Record<string, string> = {}) {
  const data = new FormData();
  const values: Record<string, string> = {
    currentPassword: "senha-atual",
    newPassword: "senha-nova-1",
    confirmPassword: "senha-nova-1",
    ...overrides,
  };

  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

describe("isProfileImage", () => {
  it("aceita http(s) e caminho do site", () => {
    assert.equal(isProfileImage("https://cdn.exemplo.com/foto.png"), true);
    assert.equal(isProfileImage("/images/logo-nix.png"), true);
    assert.equal(isProfileImage("javascript:alert(1)"), false);
    assert.equal(isProfileImage("/admin"), false);
  });
});

describe("readProfileForm", () => {
  it("normaliza o e-mail e trata foto vazia como ausência", () => {
    const parsed = readProfileForm(profileForm());

    assert.deepEqual(parsed.fieldErrors, {});
    assert.deepEqual(parsed.input, {
      name: "Administrador",
      email: "admin@admin.com",
      image: null,
    });
  });

  it("aceita uma foto do site", () => {
    const parsed = readProfileForm(
      profileForm({ image: "  /images/logo-nix.png  " }),
    );

    assert.equal(parsed.input?.image, "/images/logo-nix.png");
  });

  it("recusa nome curto, e-mail inválido e foto que não é endereço", () => {
    const { input, fieldErrors } = readProfileForm(
      profileForm({ name: "A", email: "sem-arroba", image: "nota-foto" }),
    );

    assert.equal(input, null);
    assert.equal(fieldErrors.name, "Informe o nome.");
    assert.equal(fieldErrors.email, "Informe um e-mail válido.");
    assert.equal(
      fieldErrors.image,
      "Informe um endereço http(s) ou um caminho do site (/images/...).",
    );
  });
});

describe("readPasswordForm", () => {
  it("aceita senha atual, nova senha e confirmação iguais", () => {
    const parsed = readPasswordForm(passwordForm());

    assert.deepEqual(parsed.fieldErrors, {});
    assert.deepEqual(parsed.input, {
      currentPassword: "senha-atual",
      newPassword: "senha-nova-1",
    });
  });

  it("recusa senha atual vazia, nova senha curta e confirmação diferente", () => {
    const secret = "curta";
    const { input, fieldErrors } = readPasswordForm(
      passwordForm({
        currentPassword: "",
        newPassword: secret,
        confirmPassword: "outra-senha",
      }),
    );

    assert.equal(input, null);
    assert.equal(fieldErrors.currentPassword, "Informe a senha atual.");
    assert.equal(
      fieldErrors.newPassword,
      "A nova senha precisa ter pelo menos 8 caracteres.",
    );
    assert.equal(
      fieldErrors.confirmPassword,
      "A confirmação não confere com a nova senha.",
    );
    assert.equal(JSON.stringify(fieldErrors).includes(secret), false);
  });

  it("recusa repetir a senha atual", () => {
    const { input, fieldErrors } = readPasswordForm(
      passwordForm({
        currentPassword: "senha-nova-1",
        newPassword: "senha-nova-1",
        confirmPassword: "senha-nova-1",
      }),
    );

    assert.equal(input, null);
    assert.equal(
      fieldErrors.newPassword,
      "A nova senha precisa ser diferente da atual.",
    );
  });

  it("preserva espaços na senha", () => {
    const parsed = readPasswordForm(
      passwordForm({
        currentPassword: "  atual  ",
        newPassword: "  nova senha  ",
        confirmPassword: "  nova senha  ",
      }),
    );

    assert.equal(parsed.input?.currentPassword, "  atual  ");
    assert.equal(parsed.input?.newPassword, "  nova senha  ");
  });
});
