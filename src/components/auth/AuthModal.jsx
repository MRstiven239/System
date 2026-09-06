import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../auth/AuthContext';
import { LogIn, UserPlus, Sparkles, Mail, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';

export function AuthModal({ isOpen, onClose }) {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const translateError = (errMessage) => {
    if (!errMessage) return 'Ocurrió un error al autenticar';
    if (errMessage.includes('Failed to fetch')) {
      return 'No se pudo conectar con Supabase. Reinicia el servidor local o recarga la página.';
    }
    if (errMessage.includes('User already registered')) {
      return 'Este correo ya está registrado. Haz clic abajo en "Inicia sesión aquí".';
    }
    if (errMessage.includes('Invalid login credentials')) {
      return 'Correo o contraseña incorrectos.';
    }
    if (errMessage.includes('Password should be at least')) {
      return 'La contraseña debe tener al menos 6 caracteres.';
    }
    return errMessage;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      if (isSignUp) {
        const data = await signUpWithEmail(email, password);
        if (data?.user && data?.session === null) {
          setSuccessMsg('¡Cuenta creada con éxito! Revisa tu correo para confirmar la cuenta o intenta iniciar sesión.');
        } else {
          setSuccessMsg('¡Cuenta creada e iniciada con éxito!');
          setTimeout(() => onClose(), 1500);
        }
      } else {
        await signInWithEmail(email, password);
        onClose();
      }
    } catch (err) {
      setError(translateError(err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setSuccessMsg('');
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(translateError(err.message));
    }
  };

  return (
    <Modal onClose={onClose}>
      <div className="p-6 text-slate-100 space-y-6 max-w-md w-full">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-purple-500/10 text-purple-400 mb-1 border border-purple-500/20">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            {isSignUp ? 'Crear cuenta en Mi Vida' : 'Iniciar Sesión en Mi Vida'}
          </h2>
          <p className="text-sm text-slate-400">
            Sincroniza tus hábitos, finanzas y objetivos en tiempo real entre tu PC y teléfono.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Google OAuth Button */}
        <button
          onClick={handleGoogleSignIn}
          type="button"
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white text-slate-900 font-medium hover:bg-slate-100 active:scale-[0.98] transition shadow-md cursor-pointer"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Continuar con Google
        </button>

        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-slate-700 w-full"></div>
          <span className="bg-[#121826] px-3 text-xs text-slate-500 uppercase tracking-wider relative z-10">
            O usa tu email
          </span>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Correo Electrónico</label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Contraseña</label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium active:scale-[0.98] transition flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 disabled:opacity-50 cursor-pointer"
          >
            {isSignUp ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
            {loading ? 'Cargando...' : isSignUp ? 'Registrarse' : 'Iniciar Sesión'}
          </button>
        </form>

        {/* Toggle Sign up / Sign in */}
        <div className="text-center text-xs text-slate-400">
          {isSignUp ? (
            <p>
              ¿Ya tienes cuenta?{' '}
              <button
                type="button"
                onClick={() => { setIsSignUp(false); setError(''); setSuccessMsg(''); }}
                className="text-purple-400 hover:underline font-medium ml-1 cursor-pointer"
              >
                Inicia sesión aquí
              </button>
            </p>
          ) : (
            <p>
              ¿No tienes cuenta?{' '}
              <button
                type="button"
                onClick={() => { setIsSignUp(true); setError(''); setSuccessMsg(''); }}
                className="text-purple-400 hover:underline font-medium ml-1 cursor-pointer"
              >
                Regístrate gratis
              </button>
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
