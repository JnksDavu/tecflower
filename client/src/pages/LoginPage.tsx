import type { ChangeEvent, FormEvent } from 'react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import tecflowerLogo from '@/assets/tecflowerLogo.png';
import { useAuth } from '@/contexts/AuthContext';

interface LoginFormState {
  email: string;
  password: string;
  rememberSession: boolean;
}

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  const successMessage = location.state?.message as string | undefined;
  const redirectPath = (location.state?.from as string | undefined) || '/vendas';
  const [form, setForm] = useState<LoginFormState>({
    email: '',
    password: '',
    rememberSession: true,
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange =
    (field: keyof LoginFormState) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const nextValue = field === 'rememberSession' ? event.target.checked : event.target.value;

      setForm((current) => ({
        ...current,
        [field]: nextValue,
      }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await signIn(form);
      navigate(redirectPath, { replace: true });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível entrar.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f7f4ed] px-4 py-8">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(247,244,237,0.98)_0%,rgba(239,231,255,0.92)_100%)]" />
      <div className="relative grid w-full max-w-7xl min-h-[950px] overflow-hidden rounded-[36px] bg-white shadow-[0_32px_90px_rgba(24,8,43,0.28)] lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden min-h-[950px] overflow-hidden bg-[linear-gradient(160deg,rgba(56,18,93,0.98)_0%,rgba(102,45,170,0.96)_54%,rgba(166,116,255,0.92)_100%)] p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="relative">
            <img
              src={tecflowerLogo}
              alt="TecFlower"
              className="h-46 w-auto object-contain brightness-0 invert"
            />
          </div>
          <div className="relative max-w-md space-y-6">
  
            <div className="space-y-4">
              <h1 className="text-5xl font-semibold leading-[1.05] tracking-[-0.03em]">
                Gerencie sua floricultura com tecnologia e agilidade.
              </h1>
              <p className="max-w-sm text-base leading-7 text-white/78">
                Acompanhe pedidos, clientes, financeiro e aumente sua recorrência em um só lugar.
              </p>
            </div>
          </div>
          <div className="relative flex items-center gap-3 text-sm text-white/74">

          </div>
        </section>
        <section className="flex min-h-[950px] items-center justify-center px-6 py-10 sm:px-10 lg:px-12">
          <div className="w-full max-w-md space-y-8">
            <div className="space-y-5 text-center lg:text-left">
              <div className="flex justify-center lg:hidden">
                <img src={tecflowerLogo} alt="TecFlower" className="h-16 w-auto object-contain" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#8f79cb]">Área de login</p>
                <h2 className="text-4xl font-semibold tracking-[-0.03em] text-[#2e124b]">Acesse sua conta</h2>
              </div>
            </div>
            {successMessage ? (
              <div className="rounded-2xl border border-[#d9f0df] bg-[#f4fbf6] px-4 py-3 text-sm text-[#27633a]">
                {successMessage}
              </div>
            ) : null}
            {errorMessage ? (
              <div className="rounded-2xl border border-[#f3d5df] bg-[#fff7f9] px-4 py-3 text-sm text-[#9a3253]">
                {errorMessage}
              </div>
            ) : null}
            <form className="space-y-5" onSubmit={handleSubmit}>
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
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-[#45216e]">Senha</span>
                  <Link to="/login" className="text-sm font-medium text-[#7f54d9] transition hover:text-[#6331cb]">
                    Esqueci minha senha.
                  </Link>
                </div>
                <input
                  required
                  value={form.password}
                  onChange={handleChange('password')}
                  type="password"
                  placeholder="Digite sua senha"
                  className="h-14 w-full rounded-2xl border border-[#e5ddf4] bg-[#f7f4ff] px-4 text-base text-[#2e124b] outline-none transition focus:border-[#7f54d9] focus:bg-white focus:ring-4 focus:ring-[#b89cff]/25"
                />
              </label>
              <label className="flex items-center gap-3 rounded-2xl border border-[#efe8fb] bg-[#fcfaff] px-4 py-3 text-sm text-[#6c5a88]">
                <input
                  type="checkbox"
                  checked={form.rememberSession}
                  onChange={handleChange('rememberSession')}
                  className="h-4 w-4 rounded border-[#cbb7f1] text-[#6f3fe4] focus:ring-[#b89cff]"
                />
                Manter sessão ativa neste dispositivo.
              </label>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex h-14 w-full items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#552285_0%,#8d61ff_100%)] px-6 text-base font-semibold text-white shadow-[0_20px_44px_rgba(103,55,183,0.34)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
            <p className="text-sm text-[#6c5a88]">
              Ainda não criou sua conta?{' '}
              <Link to="/cadastro" className="font-semibold text-[#7f54d9] transition hover:text-[#6331cb]">
                Cadastrar conta
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};
