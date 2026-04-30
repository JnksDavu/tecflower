import type { ChangeEvent, FormEvent } from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import tecflowerLogo from '@/assets/tecflowerLogo.png';
import { authService } from '@/services/authService';

interface RegisterFormState {
  accountName: string;
  username: string;
  email: string;
  password: string;
}

const initialFormState: RegisterFormState = {
  accountName: '',
  username: '',
  email: '',
  password: '',
};

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterFormState>(initialFormState);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange =
    (field: keyof RegisterFormState) => (event: ChangeEvent<HTMLInputElement>) => {
      setForm((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await authService.register(form);
      navigate('/login', {
        replace: true,
        state: {
          message: 'Conta criada com sucesso. Agora você já pode entrar com seu e-mail e senha.',
        },
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível criar a conta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex h-screen items-center justify-center overflow-hidden bg-[#f7f4ed] px-4 py-4">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(247,244,237,0.98)_0%,rgba(239,231,255,0.92)_100%)]" />
      <div className="relative grid h-[calc(100vh-2rem)] w-full max-w-7xl overflow-hidden rounded-[36px] bg-white shadow-[0_32px_90px_rgba(24,8,43,0.28)] lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden h-full overflow-hidden bg-[linear-gradient(160deg,rgba(56,18,93,0.98)_0%,rgba(102,45,170,0.96)_54%,rgba(166,116,255,0.92)_100%)] p-12 lg:flex lg:items-center lg:justify-center">
          <img
            src={tecflowerLogo}
            alt="TecFlower"
            className="h-52 w-auto object-contain brightness-0 invert"
          />
        </section>
        <section className="flex h-full items-center justify-center px-6 py-8 sm:px-10 lg:px-12">
          <div className="w-full max-w-md space-y-8">
            <div className="space-y-5 text-center lg:text-left">
              <div className="flex justify-center lg:hidden">
                <img src={tecflowerLogo} alt="TecFlower" className="h-16 w-auto object-contain" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#8f79cb]">
                  Cadastro inicial
                </p>
                <h2 className="text-4xl font-semibold tracking-[-0.03em] text-[#2e124b]">
                  Criar conta
                </h2>
              </div>
              
            </div>
            {errorMessage ? (
              <div className="rounded-2xl border border-[#f3d5df] bg-[#fff7f9] px-4 py-3 text-sm text-[#9a3253]">
                {errorMessage}
              </div>
            ) : null}
            <form className="space-y-5" onSubmit={handleSubmit}>
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-[#45216e]">Nome da conta</span>
                <input
                  required
                  value={form.accountName}
                  onChange={handleChange('accountName')}
                  type="text"
                  placeholder="TecFlower"
                  className="h-14 w-full rounded-2xl border border-[#e5ddf4] bg-[#f7f4ff] px-4 text-base text-[#2e124b] outline-none transition focus:border-[#7f54d9] focus:bg-white focus:ring-4 focus:ring-[#b89cff]/25"
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-[#45216e]">Usuário</span>
                <input
                  required
                  value={form.username}
                  onChange={handleChange('username')}
                  type="text"
                  placeholder="admin"
                  className="h-14 w-full rounded-2xl border border-[#e5ddf4] bg-[#f7f4ff] px-4 text-base text-[#2e124b] outline-none transition focus:border-[#7f54d9] focus:bg-white focus:ring-4 focus:ring-[#b89cff]/25"
                />
              </label>
           
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-[#45216e]">E-mail</span>
                <input
                  required
                  value={form.email}
                  onChange={handleChange('email')}
                  type="email"
                  placeholder="voce@tecflower.com"
                  className="h-14 w-full rounded-2xl border border-[#e5ddf4] bg-[#f7f4ff] px-4 text-base text-[#2e124b] outline-none transition focus:border-[#7f54d9] focus:bg-white focus:ring-4 focus:ring-[#b89cff]/25"
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-[#45216e]">Senha</span>
                <input
                  required
                  minLength={6}
                  value={form.password}
                  onChange={handleChange('password')}
                  type="password"
                  placeholder="Mínimo de 6 caracteres"
                  className="h-14 w-full rounded-2xl border border-[#e5ddf4] bg-[#f7f4ff] px-4 text-base text-[#2e124b] outline-none transition focus:border-[#7f54d9] focus:bg-white focus:ring-4 focus:ring-[#b89cff]/25"
                />
              </label>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex h-14 w-full items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#552285_0%,#8d61ff_100%)] px-6 text-base font-semibold text-white shadow-[0_20px_44px_rgba(103,55,183,0.34)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? 'Criando conta...' : 'Cadastrar conta'}
              </button>
            </form>
            <p className="text-sm text-[#6c5a88]">
              Já tem acesso?{' '}
              <Link to="/login" className="font-semibold text-[#7f54d9] transition hover:text-[#6331cb]">
                Voltar para o login
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};
