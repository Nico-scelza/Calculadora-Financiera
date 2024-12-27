def sistema_frances():
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
                ch = float(input("Inserte el valor de la cuota: "))
                break
            except:
                print("Inserte un dato válido")
        while True:
            try:
                i1 = float(input("Inserte la tasa de interes: "))
                i = i1/100
                break
            except:
                print("Inserte un dato válido")
        while True:
            try:
                n = int(input("Inserte la cantidad de períodos: "))
                break
            except:
                print("Inserte un dato válido")
        V = ch * (1 - (1 + i)**-n) / i
        return V
    elif opcion == 2:
        while True:
            try:
                V = float(input("Inserte el valor del préstamo: "))
                break
            except:
                print("Inserte un dato válido")
        while True:
            try:
                i1 = float(input("Inserte la tasa de interes: "))
                i = i1/100
                break
            except:
                print("Inserte un dato válido")
        while True:
            try:
                n = int(input("Inserte la cantidad de períodos: "))
                break
            except:
                print("Inserte un dato válido")
        ch = (V * i) / (1 - (1 + i)**-n)
        return ch
    elif opcion == 3:
        while True:
            try:
                ch = float(input("Inserte el valor de la cuota: "))
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
                    h = int(input("Inserte el período al que desea calcular la cuota de amortización: "))
                    if h < n:
                        break
                    else:
                        print("El número de períodos debe ser menor al número total de períodos")
                break
            except:
                print("Inserte un dato válido")
        while True:
            try:
                i1 = float(input("Inserte la tasa de interes: "))
                i = i1/100
                break
            except:
                print("Inserte un dato válido")
        th = ch * (1 + i)**-(n - h + 1)
        return th
    elif opcion == 4:
        while True:
            try:
                ch = float(input("Inserte el valor de la cuota: "))
                break
            except:
                print("Inserte un dato válido")
        while True:
            try:
                i1 = float(input("Inserte la tasa de interes: "))
                i = i1/100
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
                    h = int(input("Inserte la cantidad de períodos cancelados: "))
                    if h < n:
                        break
                    else:
                        print("El número de períodos cancelados debe ser menor al número total de períodos")
                break
            except:
                print("Inserte un dato válido")      
        SD = ch * (1 - (1 + i)**-(n-h)) / i
        Ih = SD * i
        return Ih
    elif opcion == 5:
        while True:
            try:
                V = float(input("Inserte el valor del préstamo: "))
                break
            except:
                print("Inserte un dato válido")
        while True:
            try:
                ch = float(input("Inserte el valor de la cuota: "))
                break
            except:
                print("Inserte un dato válido")
        while True:
            try:
                i1 = float(input("Inserte la tasa de interes: "))
                i = i1/100
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
                    h = int(input("Inserte la cantidad de períodos cancelados: "))
                    if h < n:
                        break
                    else:
                        print("El número de períodos cancelados debe ser menor al número total de períodos")
                break
            except:
                print("Inserte un dato válido")      
        SD = ch * (1 - (1 + i)**-(n-h)) / i
        Amort_acum = V - SD
        return Amort_acum
    elif opcion == 6:
        while True:
            try:
                ch = float(input("Inserte el valor de la cuota: "))
                break
            except:
                print("Inserte un dato válido")
        while True:
            try:
                i1 = float(input("Inserte la tasa de interes: "))
                i = i1/100
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
                    h = int(input("Inserte la cantidad de períodos cancelados: "))
                    if h < n:
                        break
                    else:
                        print("El número de períodos cancelados debe ser menor al número total de períodos")
                break
            except:
                print("Inserte un dato válido")      
        SD = ch * (1 - (1 + i)**-(n-h)) / i
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
                ch = float(input("Inserte el valor de la cuota: "))
                break
            except:
                print("Inserte un dato válido")
        while True:
            try:
                i1 = float(input("Inserte la tasa de interes: "))
                i = i1/100
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
                    h = int(input("Inserte la cantidad de períodos cancelados: "))
                    if h < n:
                        break
                    else:
                        print("El número de períodos cancelados debe ser menor al número total de períodos")
                break
            except:
                print("Inserte un dato válido")      
        SD = ch * (1 - (1 + i)**-(n-h)) / i
        Amort_acum = V - SD
        Ih = h * ch - Amort_acum
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
                ch = float(input("Inserte el valor de la cuota: "))
                break
            except:
                print("Inserte un dato válido")
        while True:
            try:
                n = int(input("Inserte la cantidad de períodos: "))
                break
            except:
                print("Inserte un dato válido")
        TI = (ch * n) - V
        return TI
    else:
        print("Por favor, inserte una opción válida")