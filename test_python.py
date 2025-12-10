# test_python.py
import sys
print(f"Python версия: {sys.version}")
print(f"Python путь: {sys.executable}")

# Попробуем импортировать Flask
try:
    import flask
    print("✅ Flask установлен")
except ImportError:
    print("❌ Flask НЕ установлен")

# Проверим доступные модули
print("\nДоступные модули:")
try:
    import pkgutil
    modules = [name for _, name, _ in pkgutil.iter_modules()]
    print(f"Всего модулей: {len(modules)}")
    print("Flask модули:", [m for m in modules if 'flask' in m.lower()][:10])
except:
    pass