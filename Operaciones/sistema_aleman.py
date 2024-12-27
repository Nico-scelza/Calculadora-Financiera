def sistema_aleman():
    print("¿Qué desea calcular? Elija una de estas opciones:")
    print("1. Valor del préstamo")
    print("2. Valor de la cuota")
    print("3. Cuota de amortización")
    print("4. Cuota de interés")
    print("5. Amortización acumulada")
    print("6. Saldo de deuda")
    print("7. Intereses pagados")
    print("8. Intereses totales")
    while True:
        try:
            opcion = int(input("Elija la opción: "))
            if 1 <= opcion <= 8:
                break
            else:
                print("Inserte una opción válida")
        except:
            print("Inserte un dato válido")
    if opcion == 1:
        while True:
            try:
                th = float(input("Inserte el valor de la cuota de amortización: "))
                break
            except:
                print("Inserte un dato válido")
        while True:
            try:
                n = int(input("Inserte la cantidad de períodos: "))
                break
            except:
                print("Inserte un dato válido")
        V = th * n
        return V
    elif opcion == 2:
        while True:
            try:
                th = float(input("Inserte el valor de la cuota de amortización: "))
                break
            except:
                print("Inserte un dato válido")
        while True:
            try:
                ih = float(input("Inserte la cuota de interés: "))
                break
            except:
                print("Inserte un dato válido")
        ch = th + ih
        return ch
    elif opcion == 3:
        while True:
            try:
                V = float(input("Inserte el valor del préstamo: "))
                break
            except:
                print("Inserte un dato válido")
        while True:
            try:
                n = int(input("Inserte la cantidad de períodos: "))
                break
            except:
                print("Inserte un dato válido")
        th = V / n
        return th
    elif opcion == 4:
        while True:
            try:
                n = int(input("Inserte la cantidad de períodos: "))
                break
            except:
                print("Inserte un dato válido")
        while True:
            try:
                while True:
                    h = int(input("Inserte la cantidad de cuotas canceladas: "))
                    if h < n:
                        break
                    else:
                        print("El número de períodos cancelados debe ser menor al número total de períodos")
                break
            except:
                print("Inserte un dato válido")
        while True:
            try:
                th = float(input("Inserte la cuota de amortización: "))     
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
        SD = (n - h) * th
        Ih = SD * i
        return Ih
    elif opcion == 5:
        while True:
            try:
                h = int(input("Inserte la cantidad de cuotas canceladas: "))     
                break
            except:
                print("Inserte un dato válido")
        while True:
            try:
                th = float(input("Inserte la cuota de amortización: "))     
                break   
            except:
                print("Inserte un dato válido")
        Amort_acum = h * th
        return Amort_acum
    elif opcion == 6:
        while True:
            try:
                n = int(input("Inserte la cantidad de períodos: "))
                break
            except:
                print("Inserte un dato válido")
        while True:
            try:
                while True:
                    h = int(input("Inserte la cantidad de cuotas canceladas: "))
                    if h < n:
                        break
                    else:
                        print("El número de períodos cancelados debe ser menor al número total de períodos")
                break
            except:
                print("Inserte un dato válido")  
        while True:
            try:
                th = float(input("Inserte la cuota de amortización: "))     
                break   
            except:
                print("Inserte un dato válido")
        SD = (n - h) * th
        return SD
    elif opcion == 7:
        while True:
            try:
                V = float(input("Inserte el valor del préstamo: "))
                break
            except:
                print("Inserte un dato válido")
        while True:
            try:
                n = int(input("Inserte la cantidad de períodos: "))
                break
            except:
                print("Inserte un dato válido")
        while True:
            try:
                while True:
                    h = int(input("Inserte la cantidad de cuotas canceladas: "))
                    if h < n:
                        break
                    else:
                        print("El número de períodos cancelados debe ser menor al número total de períodos")
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
        th = V / n  
        SD = (n - h) * th
        Ih = (((V * i) + (SD * i)) / 2) * h
        return Ih
    elif opcion == 8:
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
                n = int(input("Inserte la cantidad de períodos: "))
                break
            except:
                print("Inserte un dato válido")
        TI = V * i * ((n + 1) / 2)
        return TI
    else:
        print("Por favor, inserte una opción válida")