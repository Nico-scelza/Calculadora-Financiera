def sistema_americano():
    print("Sabiendo que en el sistema americano el capital se amortiza al final en un 100% y la cuota es en su totalidad en concepto de interés")
    print("¿Qué desea calcular? Elija una de estas opciones:")
    print("1. Valor de la cuota")
    print("2. Intereses pagados")
    print("3. Intereses totales")
    while True:
        try:
            opcion = int(input("Elija la opción: "))
            if 1 <= opcion <= 3:
                break
            else:
                print("Inserte una opción válida")
        except:
            print("Inserte un dato válido")
    if opcion == 1:
        while True:
            try:
                V = float(input("Inserte el valor del préstamo: "))
                break
            except:
                print("Inserte un dato válido")
        while True:
            try:
                i1 = float(input("Inserte la tasa de interés: "))
                i = i1 / 100
                break
            except:
                print("Inserte un dato válido")
        ch = V * i
        return ch
    elif opcion == 2:
        while True:
            try:
                V = float(input("Inserte el valor del préstamo: "))
                break
            except:
                print("Inserte un dato válido")
        while True:
            try:
                i1 = float(input("Inserte la tasa de interés: "))
                i = i1 / 100
                break
            except:
                print("Inserte un dato válido")
        while True:
            try:
                h = int(input("Inserte la cantidad de cuotas canceladas: "))
                break
            except:
                print("Inserte un dato válido")
        Ih = (V * i) * h
        return Ih
    elif opcion == 3:
        while True:
            try:
                V = float(input("Inserte el valor del préstamo: "))
                break
            except:
                print("Inserte un dato válido")
        while True:
            try:
                i1 = float(input("Inserte la tasa de interés: "))
                i = i1 / 100
                break
            except:
                print("Inserte un dato válido")
        while True:
            try:
                n = int(input("Inserte la cantidad total de cuotas: "))
                break
            except:
                print("Inserte un dato válido")
        IT = (V * i) * n
        return IT
    else:
        print("Por favor, inserte una opción válida")